import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Ban, Clock, AlertTriangle, CheckCircle, XCircle, 
  MessageSquare, Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Skeleton, Modal, LoadingSpinner, Badge } from '../../components/UIComponents';

const banTypeConfig = {
  MATCH_TERMINATION: { label: 'Match Termination', color: 'text-yellow-500', bg: 'bg-yellow-500/10', appealable: true },
  THREE_DAYS: { label: '3 Day Ban', color: 'text-orange-500', bg: 'bg-orange-500/10', appealable: true },
  SEVEN_DAYS: { label: '7 Day Ban', color: 'text-[#FF6B00]', bg: 'bg-[#FF6B00]/10', appealable: true },
  THIRTY_DAYS: { label: '30 Day Ban', color: 'text-red-500', bg: 'bg-red-500/10', appealable: true },
  THIRTY_DAYS: { label: '30 Day Ban', color: 'text-[#FF1A1A]', bg: 'bg-[#FF1A1A]/10' },
  PERMANENT: { label: 'Permanent Ban', color: 'text-[#FF1A1A]', bg: 'bg-[#FF1A1A]/20' },
};

const appealStatusConfig = {
  PENDING: { icon: Clock, color: 'text-yellow-500' },
  APPROVED: { icon: CheckCircle, color: 'text-green-500' },
  REJECTED: { icon: XCircle, color: 'text-[#FF1A1A]' },
};

export default function Bans() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [selectedBan, setSelectedBan] = useState(null);
  const [appealText, setAppealText] = useState('');

  const { data: bans, isLoading } = useQuery({
    queryKey: ['playerBans'],
    queryFn: () => api.getPlayerBans(token),
    enabled: !!token,
  });

  const appealMutation = useMutation({
    mutationFn: ({ banId, text }) => api.appealBan(banId, text, token),
    onSuccess: () => {
      toast.success('Appeal submitted!');
      queryClient.invalidateQueries(['playerBans']);
      setShowAppealModal(false);
      setAppealText('');
      setSelectedBan(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const activeBans = bans?.filter(b => b.isActive) || [];
  const expiredBans = bans?.filter(b => !b.isActive) || [];

  const openAppeal = (ban) => {
    setSelectedBan(ban);
    setShowAppealModal(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-['Rajdhani'] font-bold text-white mb-2">
          Ban History
        </h1>
        <p className="text-[#A1A1AA]">View your account restrictions and appeals</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : bans?.length > 0 ? (
        <div className="space-y-8">
          {/* Active Bans */}
          {activeBans.length > 0 && (
            <div>
              <h2 className="text-xl font-['Rajdhani'] font-bold text-[#FF1A1A] mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Active Restrictions
              </h2>
              <div className="space-y-4">
                {activeBans.map((ban, index) => {
                  const config = banTypeConfig[ban.banType];
                  const appealStatus = ban.appealStatus ? appealStatusConfig[ban.appealStatus] : null;
                  const AppealIcon = appealStatus?.icon || Clock;

                  return (
                    <motion.div
                      key={ban.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`glass-card rounded-lg p-6 border-l-4 border-[#FF1A1A]`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`badge ${config.bg} ${config.color}`}>
                              {config.label}
                            </span>
                            {ban.appealStatus && (
                              <span className={`flex items-center gap-1 text-sm ${appealStatus?.color}`}>
                                <AppealIcon className="w-4 h-4" />
                                Appeal {ban.appealStatus}
                              </span>
                            )}
                          </div>
                          <p className="text-white font-semibold mb-1">{ban.reason}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-[#A1A1AA]">
                            <span>Started: {format(new Date(ban.startsAt), 'MMM d, yyyy')}</span>
                            {ban.expiresAt && (
                              <span>Expires: {format(new Date(ban.expiresAt), 'MMM d, yyyy')}</span>
                            )}
                            {!ban.expiresAt && ban.banType === 'PERMANENT' && (
                              <span className="text-[#FF1A1A]">No Expiry</span>
                            )}
                          </div>
                        </div>

                        {config.appealable && ban.isActive && !ban.appealStatus && (
                          <button
                            onClick={() => openAppeal(ban)}
                            className="btn-secondary px-4 py-2 flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Submit Appeal
                          </button>
                        )}
                      </div>

                      {ban.appealText && (
                        <div className="mt-4 p-4 bg-white/5 rounded">
                          <p className="text-sm text-[#A1A1AA] mb-1">Your Appeal:</p>
                          <p className="text-white">{ban.appealText}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expired Bans */}
          {expiredBans.length > 0 && (
            <div>
              <h2 className="text-xl font-['Rajdhani'] font-bold text-[#A1A1AA] mb-4">
                Past Restrictions
              </h2>
              <div className="space-y-4">
                {expiredBans.map((ban, index) => {
                  const config = banTypeConfig[ban.banType];

                  return (
                    <motion.div
                      key={ban.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card rounded-lg p-6 opacity-60"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="badge bg-[#52525B]">{config.label}</span>
                        <span className="text-sm text-green-500 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Resolved
                        </span>
                      </div>
                      <p className="text-[#A1A1AA] mb-1">{ban.reason}</p>
                      <p className="text-sm text-[#52525B]">
                        {format(new Date(ban.startsAt), 'MMM d, yyyy')} - {ban.resolvedAt ? format(new Date(ban.resolvedAt), 'MMM d, yyyy') : 'Expired'}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-['Rajdhani'] font-bold text-white mb-2">
            Clean Record!
          </h3>
          <p className="text-[#A1A1AA]">
            You have no ban history. Keep playing fair!
          </p>
        </div>
      )}

      {/* Appeal Guidelines */}
      <div className="glass-card rounded-lg p-6">
        <h3 className="text-lg font-['Rajdhani'] font-bold text-white mb-4">
          Appeal Guidelines
        </h3>
        <ul className="space-y-2 text-sm text-[#A1A1AA]">
          <li>• Only 3-day and 7-day bans can be appealed</li>
          <li>• You can only submit one appeal per ban</li>
          <li>• Appeals are reviewed within 24-48 hours</li>
          <li>• Provide honest and detailed explanation</li>
          <li>• False appeals may result in extended bans</li>
          <li>• 30-day and Permanent bans cannot be appealed</li>
        </ul>
      </div>

      {/* Appeal Modal */}
      <Modal
        isOpen={showAppealModal}
        onClose={() => { setShowAppealModal(false); setAppealText(''); setSelectedBan(null); }}
        title="Submit Appeal"
      >
        <div className="space-y-4">
          {selectedBan && (
            <div className="p-4 bg-[#FF1A1A]/10 border border-[#FF1A1A]/30 rounded">
              <p className="text-sm text-[#A1A1AA] mb-1">Ban Reason:</p>
              <p className="text-white">{selectedBan.reason}</p>
            </div>
          )}

          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">
              Your Explanation
            </label>
            <textarea
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              className="input-dark w-full px-4 py-3 rounded h-32 resize-none"
              placeholder="Explain why you believe this ban should be lifted..."
              maxLength={500}
            />
            <p className="text-xs text-[#52525B] mt-1 text-right">
              {appealText.length}/500
            </p>
          </div>

          <button
            onClick={() => appealMutation.mutate({ banId: selectedBan.id, text: appealText })}
            disabled={!appealText || appealText.length < 20 || appealMutation.isPending}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {appealMutation.isPending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Appeal
              </>
            )}
          </button>

          <p className="text-xs text-[#A1A1AA] text-center">
            Minimum 20 characters required
          </p>
        </div>
      </Modal>
    </div>
  );
}