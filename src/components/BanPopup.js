import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Ban, Clock, AlertTriangle, MessageSquare, 
  X, Shield, ChevronRight, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const banTypeLabels = {
  MATCH_TERMINATION: 'Match Termination',
  THREE_DAYS: '3 Day Ban',
  SEVEN_DAYS: '7 Day Ban',
  THIRTY_DAYS: '30 Day Ban',
  PERMANENT: 'Permanent Ban',
};

const banTypeColors = {
  MATCH_TERMINATION: '#FFD700',
  THREE_DAYS: '#FF6B00',
  SEVEN_DAYS: '#FF6B00',
  THIRTY_DAYS: '#FF3300',
  PERMANENT: '#FF1A1A',
};

function CountdownTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expiresAt) return;

    const calculate = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Ban Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      else setTimeLeft(`${mins}m ${secs}s`);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="text-center">
      <p className="text-[#A1A1AA] text-sm mb-1">Ban expires in</p>
      <div className="font-['Rajdhani'] font-bold text-2xl text-[#FF6B00] font-mono tracking-wider">
        {timeLeft || 'Calculating...'}
      </div>
    </div>
  );
}

export default function BanPopup({ ban, onAppeal, onLogout }) {
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealText, setAppealText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [appealed, setAppealed] = useState(!!ban?.appealStatus);
  const isPermanent = ban?.banType === 'PERMANENT';
  const canAppeal = !isPermanent && !appealed;
  const banColor = banTypeLabels[ban?.banType] ? banTypeColors[ban?.banType] : '#FF6B00';

  const handleSubmitAppeal = async () => {
    if (!appealText.trim() || appealText.length < 10) return;
    setSubmitting(true);
    try {
      await onAppeal(ban.id, appealText);
      setAppealed(true);
      setShowAppealForm(false);
    } catch (e) {
      // error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop - non-dismissible, player CANNOT close this */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-md"
        />

        {/* Popup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative w-full max-w-md bg-[#111111] rounded-xl border-2 overflow-hidden"
          style={{ borderColor: banColor }}
        >
          {/* Top Banner */}
          <div
            className="p-6 text-center"
            style={{ background: `linear-gradient(135deg, ${banColor}20, ${banColor}05)` }}
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2"
              style={{ 
                background: `${banColor}20`, 
                borderColor: banColor 
              }}
            >
              <Ban className="w-10 h-10" style={{ color: banColor }} />
            </motion.div>

            <h2 className="text-2xl font-['Rajdhani'] font-bold text-white mb-1">
              Account Restricted
            </h2>
            <div
              className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-2"
              style={{ background: `${banColor}30`, color: banColor }}
            >
              {banTypeLabels[ban?.banType] || ban?.banType}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            {/* Reason */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#A1A1AA] mb-1">Reason for ban</p>
                  <p className="text-white font-medium">{ban?.reason || 'Violation of platform rules'}</p>
                </div>
              </div>
            </div>

            {/* Countdown */}
            {!isPermanent && ban?.expiresAt && (
              <div className="bg-[#FF6B00]/10 rounded-lg p-4 border border-[#FF6B00]/20">
                <CountdownTimer expiresAt={ban.expiresAt} />
              </div>
            )}

            {isPermanent && (
              <div className="bg-[#FF1A1A]/10 rounded-lg p-4 border border-[#FF1A1A]/20 text-center">
                <p className="text-[#FF1A1A] font-bold">⛔ Permanent Ban</p>
                <p className="text-sm text-[#A1A1AA] mt-1">This ban cannot be automatically lifted</p>
              </div>
            )}

            {/* Appeal status */}
            {ban?.appealStatus === 'PENDING' && (
              <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <p className="text-yellow-500 text-sm">Appeal submitted — pending admin review</p>
              </div>
            )}

            {ban?.appealStatus === 'REJECTED' && (
              <div className="bg-[#FF1A1A]/10 rounded-lg p-3 border border-[#FF1A1A]/20 flex items-center gap-2">
                <X className="w-4 h-4 text-[#FF1A1A]" />
                <p className="text-[#FF1A1A] text-sm">Appeal was rejected by admin</p>
              </div>
            )}

            {/* Appeal Form */}
            {showAppealForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <p className="text-sm text-[#A1A1AA]">
                  Explain why your ban should be lifted (min. 10 characters):
                </p>
                <textarea
                  value={appealText}
                  onChange={(e) => setAppealText(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/20 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-[#FF6B00]"
                  rows={4}
                  placeholder="Describe why you believe this ban was unfair..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAppealForm(false)}
                    className="flex-1 py-2 rounded bg-white/10 text-[#A1A1AA] hover:bg-white/20 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitAppeal}
                    disabled={submitting || appealText.length < 10}
                    className="flex-1 py-2 rounded text-sm font-bold text-black disabled:opacity-50"
                    style={{ background: banColor }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Appeal'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            {!showAppealForm && (
              <div className="space-y-2">
                {canAppeal && (
                  <button
                    onClick={() => setShowAppealForm(true)}
                    className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium text-black"
                    style={{ background: banColor }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Appeal This Ban
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium text-[#A1A1AA] bg-white/5 hover:bg-white/10 border border-white/10"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}

            <p className="text-xs text-[#52525B] text-center">
              For support, contact us at support@osglive.in
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}