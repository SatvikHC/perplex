import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Wallet, Clock, CheckCircle, XCircle, AlertCircle,
  CreditCard, User, QrCode, Gift, Settings,
  ToggleLeft, ToggleRight, Plus, Trash2, Copy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Skeleton, Modal, LoadingSpinner, Badge } from '../../components/UIComponents';

const statusConfig = {
  PENDING: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  PROCESSING: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  COMPLETED: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  FAILED: { icon: XCircle, color: 'text-[#FF1A1A]', bg: 'bg-[#FF1A1A]/10' },
};

const topupStatusConf = {
  PENDING: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500' },
  APPROVED: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500' },
  REJECTED: { color: 'text-[#FF1A1A]', bg: 'bg-[#FF1A1A]/10', border: 'border-[#FF1A1A]' },
};

export default function AdminWithdrawals() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Tab
  const [activeTab, setActiveTab] = useState('withdrawals');

  // Withdrawal
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // Topup
  const [topupFilter, setTopupFilter] = useState('PENDING');
  const [selectedTopup, setSelectedTopup] = useState(null);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupNote, setTopupNote] = useState('');

  // Payment Settings
  const [settings, setSettings] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Redeem Codes
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [codeAmount, setCodeAmount] = useState('');
  const [codeMaxUses, setCodeMaxUses] = useState('1');
  const [codeExpiry, setCodeExpiry] = useState('24');

  // Queries
  const { data: withdrawals, isLoading: wLoading } = useQuery({
    queryKey: ['adminWithdrawals', statusFilter],
    queryFn: () => api.getAdminWithdrawals(statusFilter, token),
    enabled: !!token && activeTab === 'withdrawals',
  });

  const { data: topupRequests, isLoading: tLoading } = useQuery({
    queryKey: ['adminTopups', topupFilter],
    queryFn: () => api.getAdminTopupRequests(topupFilter, token),
    enabled: !!token && activeTab === 'topup',
  });

  const { data: paySettings } = useQuery({
    queryKey: ['paymentSettingsFull'],
    queryFn: () => api.getPaymentSettingsFull(token),
    enabled: !!token,
    onSuccess: (data) => { if (!settings) setSettings(data); }
  });

  const { data: redeemCodes } = useQuery({
    queryKey: ['redeemCodes'],
    queryFn: () => api.getRedeemCodes(token),
    enabled: !!token && activeTab === 'codes',
  });

  // Mutations
  const processMutation = useMutation({
    mutationFn: (data) => api.processWithdrawal(data.id, {
      status: data.status, utrNumber: data.utrNumber, rejectionReason: data.rejectionReason,
    }, token),
    onSuccess: () => {
      toast.success('Withdrawal processed');
      queryClient.invalidateQueries(['adminWithdrawals']);
      setShowProcessModal(false);
      setUtrNumber(''); setRejectReason('');
    },
    onError: (err) => toast.error(err.message),
  });

  const topupMutation = useMutation({
    mutationFn: ({ id, action }) => api.processTopupRequest(id, action, topupNote, token),
    onSuccess: (_, vars) => {
      toast.success(`Topup ${vars.action.toLowerCase()}`);
      queryClient.invalidateQueries(['adminTopups']);
      setShowTopupModal(false);
      setTopupNote('');
    },
    onError: (err) => toast.error(err.message),
  });

  const settingsMutation = useMutation({
    mutationFn: (s) => api.updatePaymentSettings(s, token),
    onSuccess: () => {
      toast.success('Payment settings saved!');
      queryClient.invalidateQueries(['paymentSettingsFull', 'paymentSettings']);
      setShowSettingsModal(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const createCodeMutation = useMutation({
    mutationFn: () => api.createRedeemCode(newCode, parseFloat(codeAmount), parseInt(codeMaxUses), parseInt(codeExpiry), token),
    onSuccess: () => {
      toast.success(`Code ${newCode.toUpperCase()} created!`);
      queryClient.invalidateQueries(['redeemCodes']);
      setShowCodeModal(false);
      setNewCode(''); setCodeAmount(''); setCodeMaxUses('1'); setCodeExpiry('24');
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteCodeMutation = useMutation({
    mutationFn: (id) => api.deleteRedeemCode(id, token),
    onSuccess: () => {
      toast.success('Code deactivated');
      queryClient.invalidateQueries(['redeemCodes']);
    },
  });

  const pendingTopups = topupRequests?.filter(t => t.status === 'PENDING').length || 0;
  const pendingWithdrawals = withdrawals?.filter(w => w.status === 'PENDING').length || 0;

  const Toggle = ({ enabled, onChange, label }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
      <span className="text-white font-medium">{label}</span>
      <button onClick={() => onChange(!enabled)} className="flex items-center gap-2">
        {enabled
          ? <ToggleRight className="w-10 h-10 text-[#FF6B00]" />
          : <ToggleLeft className="w-10 h-10 text-[#52525B]" />
        }
        <span className={`text-sm font-bold ${enabled ? 'text-[#FF6B00]' : 'text-[#52525B]'}`}>
          {enabled ? 'ON' : 'OFF'}
        </span>
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-['Rajdhani'] font-bold text-white mb-2">Payments</h1>
          <p className="text-[#A1A1AA]">Manage withdrawals, topups, and payment settings</p>
        </div>
        <button
          onClick={() => {
            setSettings(paySettings || {});
            setShowSettingsModal(true);
          }}
          className="btn-secondary px-4 py-2 flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Payment Settings
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { key: 'withdrawals', label: 'Withdrawals', badge: pendingWithdrawals, icon: Wallet },
          { key: 'topup', label: 'Topup Requests', badge: pendingTopups, icon: QrCode },
          { key: 'codes', label: 'Redeem Codes', badge: 0, icon: Gift },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-t font-medium transition-all flex items-center gap-2 relative flex-shrink-0 ${
                activeTab === tab.key ? 'bg-[#FF6B00] text-black' : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF1A1A] rounded-full text-xs flex items-center justify-center text-white font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* WITHDRAWALS TAB */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded font-medium ${statusFilter === s ? 'bg-[#FF6B00] text-black' : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'}`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>

          {wLoading ? (
            <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
          ) : withdrawals?.length > 0 ? (
            withdrawals.map((w, i) => {
              const sc = statusConfig[w.status] || statusConfig.PENDING;
              const SI = sc.icon;
              return (
                <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`glass-card rounded-lg p-6 border-l-4 ${w.status === 'PENDING' ? 'border-yellow-500' : w.status === 'COMPLETED' ? 'border-green-500' : w.status === 'FAILED' ? 'border-[#FF1A1A]' : 'border-blue-500'}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${sc.bg}`}>
                        <SI className={`w-6 h-6 ${sc.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-['Rajdhani'] font-bold text-white">₹{w.amount}</span>
                          <Badge variant={w.status === 'PENDING' ? 'warning' : w.status === 'COMPLETED' ? 'success' : 'danger'}>{w.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-[#A1A1AA] mt-1">
                          <span className="flex items-center gap-1"><User className="w-4 h-4" />{w.playerIgn}</span>
                          <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" />{w.upiId}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{w.requestedAt ? format(new Date(w.requestedAt), 'MMM d, h:mm a') : '-'}</span>
                        </div>
                      </div>
                    </div>
                    {w.status === 'PENDING' && (
                      <button onClick={() => { setSelectedWithdrawal(w); setShowProcessModal(true); }} className="btn-primary px-6 py-2">
                        Process
                      </button>
                    )}
                    {w.utrNumber && <div className="text-right"><span className="text-xs text-[#A1A1AA]">UTR:</span><p className="text-white font-mono">{w.utrNumber}</p></div>}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <Wallet className="w-16 h-16 text-[#52525B] mx-auto mb-4" />
              <p className="text-[#A1A1AA]">No {statusFilter || ''} withdrawals</p>
            </div>
          )}
        </div>
      )}

      {/* TOPUP REQUESTS TAB */}
      {activeTab === 'topup' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['PENDING', 'APPROVED', 'REJECTED', ''].map(s => (
              <button key={s} onClick={() => setTopupFilter(s)}
                className={`px-4 py-2 rounded font-medium ${topupFilter === s ? 'bg-[#FF6B00] text-black' : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'}`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>

          {tLoading ? (
            <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
          ) : topupRequests?.length > 0 ? (
            topupRequests.map((req, i) => {
              const sc = topupStatusConf[req.status] || topupStatusConf.PENDING;
              return (
                <motion.div key={req.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`glass-card rounded-lg p-6 border-l-4 ${sc.border}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-['Rajdhani'] font-bold text-white">₹{req.amount}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${sc.bg} ${sc.color}`}>{req.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-[#A1A1AA]">
                        <span><User className="w-4 h-4 inline mr-1" />{req.playerIgn}</span>
                        <span>UTR: <span className="text-white font-mono">{req.utrNumber}</span></span>
                        <span>{req.requestedAt ? format(new Date(req.requestedAt), 'MMM d, h:mm a') : '-'}</span>
                      </div>
                    </div>
                    {req.status === 'PENDING' && (
                      <button onClick={() => { setSelectedTopup(req); setShowTopupModal(true); }} className="btn-primary px-6 py-2">
                        Verify & Process
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <QrCode className="w-16 h-16 text-[#52525B] mx-auto mb-4" />
              <p className="text-[#A1A1AA]">No {topupFilter || ''} topup requests</p>
            </div>
          )}
        </div>
      )}

      {/* REDEEM CODES TAB */}
      {activeTab === 'codes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowCodeModal(true)} className="btn-primary px-6 py-2 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Code
            </button>
          </div>

          {redeemCodes?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redeemCodes.map((code) => (
                <div key={code.id} className={`glass-card rounded-lg p-4 border ${code.isActive ? 'border-[#FF6B00]/30' : 'border-white/10 opacity-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-[#FF6B00]" />
                      <span className="font-mono font-bold text-white text-lg tracking-widest">{code.code}</span>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(code.code); toast.success('Copied!'); }}
                      className="text-[#A1A1AA] hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[#A1A1AA]">Amount</span>
                      <p className="text-[#FFD700] font-bold">₹{code.amount}</p>
                    </div>
                    <div>
                      <span className="text-[#A1A1AA]">Uses</span>
                      <p className="text-white">{code.useCount || 0} / {code.maxUses}</p>
                    </div>
                    <div>
                      <span className="text-[#A1A1AA]">Expires</span>
                      <p className="text-white text-xs">{code.expiresAt ? format(new Date(code.expiresAt), 'MMM d, h:mm a') : '-'}</p>
                    </div>
                    <div>
                      <span className="text-[#A1A1AA]">Status</span>
                      <p className={code.isActive ? 'text-green-500' : 'text-[#FF1A1A]'}>
                        {code.isActive ? 'Active' : 'Deactivated'}
                      </p>
                    </div>
                  </div>
                  {code.isActive && (
                    <button
                      onClick={() => { if (window.confirm('Deactivate this code?')) deleteCodeMutation.mutate(code.id); }}
                      className="mt-3 w-full py-1.5 rounded bg-[#FF1A1A]/10 text-[#FF1A1A] text-xs hover:bg-[#FF1A1A]/20 flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Deactivate
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Gift className="w-16 h-16 text-[#52525B] mx-auto mb-4" />
              <p className="text-[#A1A1AA]">No redeem codes created yet</p>
            </div>
          )}
        </div>
      )}

      {/* PROCESS WITHDRAWAL MODAL */}
      <Modal isOpen={showProcessModal} onClose={() => { setShowProcessModal(false); setUtrNumber(''); setRejectReason(''); }} title="Process Withdrawal">
        {selectedWithdrawal && (
          <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded">
              <div className="flex justify-between mb-2">
                <span className="text-[#A1A1AA]">Amount</span>
                <span className="text-2xl font-['Rajdhani'] font-bold text-[#FFD700]">₹{selectedWithdrawal.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">UPI ID</span>
                <span className="text-white font-mono">{selectedWithdrawal.upiId}</span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Approve</h4>
              <input type="text" value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} className="input-dark w-full px-4 py-3 rounded" placeholder="Enter UTR/Transaction ID" />
              <button onClick={() => processMutation.mutate({ id: selectedWithdrawal.id, status: 'COMPLETED', utrNumber })} disabled={!utrNumber || processMutation.isPending} className="btn-primary w-full py-3 bg-green-500 hover:bg-green-600">
                {processMutation.isPending ? <LoadingSpinner size="sm" /> : 'Approve & Mark Completed'}
              </button>
            </div>
            <div className="border-t border-white/10 pt-4 space-y-3">
              <h4 className="font-semibold text-white">Reject</h4>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="input-dark w-full px-4 py-3 rounded h-20 resize-none" placeholder="Rejection reason..." />
              <button onClick={() => processMutation.mutate({ id: selectedWithdrawal.id, status: 'FAILED', rejectionReason: rejectReason })} disabled={!rejectReason || processMutation.isPending} className="btn-secondary w-full py-3 text-[#FF1A1A] border-[#FF1A1A] hover:bg-[#FF1A1A] hover:text-white">
                Reject & Refund
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* TOPUP VERIFICATION MODAL */}
      <Modal isOpen={showTopupModal} onClose={() => { setShowTopupModal(false); setTopupNote(''); }} title="Verify Topup Request">
        {selectedTopup && (
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded space-y-2">
              <div className="flex justify-between"><span className="text-[#A1A1AA]">Player</span><span className="text-white font-bold">{selectedTopup.playerIgn}</span></div>
              <div className="flex justify-between"><span className="text-[#A1A1AA]">Amount</span><span className="text-[#FFD700] font-bold text-xl">₹{selectedTopup.amount}</span></div>
              <div className="flex justify-between"><span className="text-[#A1A1AA]">UTR Number</span><span className="text-white font-mono">{selectedTopup.utrNumber}</span></div>
            </div>
            <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded p-3">
              <p className="text-xs text-[#FF6B00]">⚠️ Verify this UTR on your UPI app before approving</p>
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Note (optional)</label>
              <input type="text" value={topupNote} onChange={(e) => setTopupNote(e.target.value)} className="input-dark w-full px-4 py-3 rounded" placeholder="Optional note to player..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => topupMutation.mutate({ id: selectedTopup.id, action: 'APPROVED' })} disabled={topupMutation.isPending} className="btn-primary py-3 bg-green-500 hover:bg-green-600 flex items-center justify-center gap-2">
                {topupMutation.isPending ? <LoadingSpinner size="sm" /> : <><CheckCircle className="w-4 h-4" /> Approve</>}
              </button>
              <button onClick={() => topupMutation.mutate({ id: selectedTopup.id, action: 'REJECTED' })} disabled={topupMutation.isPending} className="btn-secondary py-3 text-[#FF1A1A] border-[#FF1A1A] hover:bg-[#FF1A1A] hover:text-white flex items-center justify-center gap-2">
                {topupMutation.isPending ? <LoadingSpinner size="sm" /> : <><XCircle className="w-4 h-4" /> Reject</>}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* PAYMENT SETTINGS MODAL */}
      <Modal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="Payment Settings">
        {settings !== null && (
          <div className="space-y-4">
            <Toggle enabled={settings.upiEnabled !== false} onChange={(v) => setSettings({...settings, upiEnabled: v})} label="UPI / QR Code Payment" />
            <Toggle enabled={settings.redeemEnabled !== false} onChange={(v) => setSettings({...settings, redeemEnabled: v})} label="Redeem Code System" />
            <Toggle enabled={settings.razorpayEnabled === true} onChange={(v) => setSettings({...settings, razorpayEnabled: v})} label="Razorpay (requires API keys)" />

            {(settings.upiEnabled !== false) && (
              <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-semibold">UPI Settings</h4>
                <div>
                  <label className="block text-sm text-[#A1A1AA] mb-1">Your UPI ID</label>
                  <input type="text" value={settings.upiId || ''} onChange={(e) => setSettings({...settings, upiId: e.target.value})} className="input-dark w-full px-4 py-3 rounded" placeholder="yourname@upi" />
                </div>
                <div>
                  <label className="block text-sm text-[#A1A1AA] mb-1">QR Code Image URL (optional)</label>
                  <input type="text" value={settings.qrCodeUrl || ''} onChange={(e) => setSettings({...settings, qrCodeUrl: e.target.value})} className="input-dark w-full px-4 py-3 rounded" placeholder="https://..." />
                  <p className="text-xs text-[#52525B] mt-1">Upload QR to any image host and paste URL here</p>
                </div>
              </div>
            )}

            {settings.razorpayEnabled && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-500">
                ⚠️ Add RAZORPAY_KEY_ID env variable in Koyeb before enabling
              </div>
            )}

            <button
              onClick={() => settingsMutation.mutate(settings)}
              disabled={settingsMutation.isPending}
              className="btn-primary w-full py-3"
            >
              {settingsMutation.isPending ? <LoadingSpinner size="sm" /> : 'Save Settings'}
            </button>
          </div>
        )}
      </Modal>

      {/* CREATE REDEEM CODE MODAL */}
      <Modal isOpen={showCodeModal} onClose={() => setShowCodeModal(false)} title="Create Redeem Code">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Code</label>
            <input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} className="input-dark w-full px-4 py-3 rounded font-mono tracking-widest text-center text-lg" placeholder="OSG2024" maxLength={20} />
          </div>
          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Amount (₹)</label>
            <input type="number" value={codeAmount} onChange={(e) => setCodeAmount(e.target.value)} className="input-dark w-full px-4 py-3 rounded" placeholder="50" min="1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Max Uses</label>
              <input type="number" value={codeMaxUses} onChange={(e) => setCodeMaxUses(e.target.value)} className="input-dark w-full px-4 py-3 rounded" min="1" />
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Expires in (hours)</label>
              <input type="number" value={codeExpiry} onChange={(e) => setCodeExpiry(e.target.value)} className="input-dark w-full px-4 py-3 rounded" min="1" />
            </div>
          </div>
          <button
            onClick={() => createCodeMutation.mutate()}
            disabled={!newCode || !codeAmount || createCodeMutation.isPending}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {createCodeMutation.isPending ? <LoadingSpinner size="sm" /> : <><Gift className="w-4 h-4" /> Create Code</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}