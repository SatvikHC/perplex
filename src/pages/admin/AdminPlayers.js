import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Users, Search, Ban, Shield, Gamepad2, 
  Mail, Phone, AlertTriangle, MessageSquare,
  CheckCircle, XCircle, Clock, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Skeleton, Modal, LoadingSpinner, Badge } from '../../components/UIComponents';

const banTypes = [
  { value: 'MATCH_TERMINATION', label: 'Match Termination' },
  { value: 'THREE_DAYS', label: '3 Day Ban' },
  { value: 'SEVEN_DAYS', label: '7 Day Ban' },
  { value: 'THIRTY_DAYS', label: '30 Day Ban' },
  { value: 'PERMANENT', label: 'Permanent Ban' },
];

const banTypeLabels = {
  MATCH_TERMINATION: 'Match Termination',
  THREE_DAYS: '3 Day Ban',
  SEVEN_DAYS: '7 Day Ban',
  THIRTY_DAYS: '30 Day Ban',
  PERMANENT: 'Permanent Ban',
};

export default function AdminPlayers() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('players');
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banType, setBanType] = useState('THREE_DAYS');
  const [banReason, setBanReason] = useState('');
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealNote, setAppealNote] = useState('');

  const { data: players, isLoading, refetch } = useQuery({
    queryKey: ['adminPlayers', search],
    queryFn: () => api.getAdminPlayers(search, token),
    enabled: !!token,
  });

  const { data: appeals, isLoading: appealsLoading } = useQuery({
    queryKey: ['adminAppeals'],
    queryFn: () => api.getAdminAppeals(token),
    enabled: !!token && activeTab === 'appeals',
    refetchInterval: 30000,
  });

  const { data: appealCount } = useQuery({
    queryKey: ['appealCount'],
    queryFn: () => api.getAppealCount(token),
    enabled: !!token,
    refetchInterval: 60000,
  });

  const banMutation = useMutation({
    mutationFn: (data) => api.banPlayer(data.userId, {
      userId: data.userId,
      banType: data.banType,
      reason: data.reason,
      ipBanned: data.banType === 'PERMANENT',
    }, token),
    onSuccess: () => {
      toast.success('Player banned');
      queryClient.invalidateQueries(['adminPlayers']);
      setShowBanModal(false);
      setBanReason('');
    },
    onError: (err) => toast.error(err.message),
  });

  const unbanMutation = useMutation({
    mutationFn: (playerId) => api.unbanPlayer(playerId, token),
    onSuccess: () => {
      toast.success('Player unbanned');
      queryClient.invalidateQueries(['adminPlayers']);
    },
    onError: (err) => toast.error(err.message),
  });

  const appealMutation = useMutation({
    mutationFn: ({ banId, action, note }) => api.processAppeal(banId, action, note, token),
    onSuccess: (_, vars) => {
      toast.success(`Appeal ${vars.action === 'APPROVED' ? 'approved' : 'rejected'}`);
      queryClient.invalidateQueries(['adminAppeals']);
      queryClient.invalidateQueries(['appealCount']);
      queryClient.invalidateQueries(['adminPlayers']);
      setShowAppealModal(false);
      setAppealNote('');
    },
    onError: (err) => toast.error(err.message),
  });

  const clearRateLimitsMutation = useMutation({
    mutationFn: () => api.clearRateLimits(token),
    onSuccess: () => toast.success('Rate limits cleared! Players can login now.'),
    onError: (err) => toast.error(err.message),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const pendingAppealsCount = appealCount?.pendingAppeals || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-['Rajdhani'] font-bold text-white mb-2">
            Player Management
          </h1>
          <p className="text-[#A1A1AA]">Search, manage players and handle ban appeals</p>
        </div>
        {/* Clear Rate Limits Button */}
        <button
          onClick={() => clearRateLimitsMutation.mutate()}
          disabled={clearRateLimitsMutation.isPending}
          className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
        >
          <Bell className="w-4 h-4" />
          {clearRateLimitsMutation.isPending ? 'Clearing...' : 'Clear Rate Limits'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('players')}
          className={`px-5 py-2 rounded-t font-medium transition-all ${
            activeTab === 'players'
              ? 'bg-[#FF6B00] text-black'
              : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Players
          </span>
        </button>
        <button
          onClick={() => setActiveTab('appeals')}
          className={`px-5 py-2 rounded-t font-medium transition-all relative ${
            activeTab === 'appeals'
              ? 'bg-[#FF6B00] text-black'
              : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Ban Appeals
            {pendingAppealsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF1A1A] rounded-full text-xs flex items-center justify-center text-white font-bold">
                {pendingAppealsCount}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div className="space-y-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-dark w-full pl-12 pr-4 py-3 rounded"
                placeholder="Search by IGN, FF UID, email, or mobile..."
              />
            </div>
            <button type="submit" className="btn-primary px-6">
              Search
            </button>
          </form>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
            </div>
          ) : players?.length > 0 ? (
            <div className="space-y-4">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-lg p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#FF6B00] rounded-full flex items-center justify-center text-black text-xl font-bold">
                        {player.ign?.[0] || 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-['Rajdhani'] font-bold text-white">
                            {player.ign}
                          </h3>
                          {player.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="danger">Banned</Badge>
                          )}
                          {player.role === 'ADMIN' && (
                            <Badge variant="primary">Admin</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-[#A1A1AA] mt-1">
                          <span className="flex items-center gap-1">
                            <Gamepad2 className="w-4 h-4" />
                            {player.ffUid}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {player.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {player.mobile}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {player.role !== 'ADMIN' && (
                        <>
                          {player.isActive ? (
                            <button
                              onClick={() => { setSelectedPlayer(player); setShowBanModal(true); }}
                              className="btn-secondary px-4 py-2 flex items-center gap-2 text-[#FF1A1A] border-[#FF1A1A] hover:bg-[#FF1A1A] hover:text-white"
                            >
                              <Ban className="w-4 h-4" />
                              Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => unbanMutation.mutate(player.id)}
                              disabled={unbanMutation.isPending}
                              className="btn-secondary px-4 py-2 flex items-center gap-2 text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
                            >
                              <Shield className="w-4 h-4" />
                              {unbanMutation.isPending ? 'Unbanning...' : 'Unban'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-[#A1A1AA]">Full Name</span>
                      <p className="text-white">{player.fullName}</p>
                    </div>
                    <div>
                      <span className="text-[#A1A1AA]">State</span>
                      <p className="text-white">{player.state}</p>
                    </div>
                    <div>
                      <span className="text-[#A1A1AA]">Wallet</span>
                      <p className="text-[#FFD700]">₹{player.walletBalance?.toFixed(2) || 0}</p>
                    </div>
                    <div>
                      <span className="text-[#A1A1AA]">Joined</span>
                      <p className="text-white">
                        {player.createdAt ? format(new Date(player.createdAt), 'MMM d, yyyy') : '-'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-[#52525B] mx-auto mb-4" />
              <h3 className="text-xl font-['Rajdhani'] font-bold text-white mb-2">
                {search ? 'No Players Found' : 'Search for Players'}
              </h3>
              <p className="text-[#A1A1AA]">
                {search ? 'Try a different search term' : 'Enter IGN, FF UID, email, or mobile to search'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Appeals Tab */}
      {activeTab === 'appeals' && (
        <div className="space-y-4">
          {appealsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-lg" />)}
            </div>
          ) : appeals?.length > 0 ? (
            appeals.map((ban, index) => (
              <motion.div
                key={ban.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`glass-card rounded-lg p-6 border-l-4 ${
                  ban.appealStatus === 'PENDING' ? 'border-yellow-500' :
                  ban.appealStatus === 'APPROVED' ? 'border-green-500' :
                  'border-[#FF1A1A]'
                }`}
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    {/* Player Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#FF6B00] rounded-full flex items-center justify-center text-black font-bold">
                        {ban.player?.ign?.[0] || 'P'}
                      </div>
                      <div>
                        <p className="font-['Rajdhani'] font-bold text-white">{ban.player?.ign}</p>
                        <p className="text-xs text-[#A1A1AA]">UID: {ban.player?.ffUid} • {ban.player?.email}</p>
                      </div>
                    </div>

                    {/* Ban Details */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 text-sm">
                      <div>
                        <span className="text-[#A1A1AA]">Ban Type</span>
                        <p className="text-[#FF1A1A] font-semibold">{banTypeLabels[ban.banType] || ban.banType}</p>
                      </div>
                      <div>
                        <span className="text-[#A1A1AA]">Ban Reason</span>
                        <p className="text-white">{ban.reason}</p>
                      </div>
                      <div>
                        <span className="text-[#A1A1AA]">Appeal Status</span>
                        <p className={`font-semibold ${
                          ban.appealStatus === 'PENDING' ? 'text-yellow-500' :
                          ban.appealStatus === 'APPROVED' ? 'text-green-500' :
                          'text-[#FF1A1A]'
                        }`}>
                          {ban.appealStatus}
                        </p>
                      </div>
                    </div>

                    {/* Appeal Text */}
                    <div className="bg-white/5 rounded p-3 border border-white/10">
                      <p className="text-xs text-[#A1A1AA] mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Player's Appeal Message:
                      </p>
                      <p className="text-white text-sm">{ban.appealText || 'No message provided'}</p>
                    </div>

                    {ban.appealedAt && (
                      <p className="text-xs text-[#52525B] mt-2">
                        Appealed: {format(new Date(ban.appealedAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons - only for PENDING */}
                  {ban.appealStatus === 'PENDING' && (
                    <div className="flex lg:flex-col gap-2 lg:w-40">
                      <button
                        onClick={() => {
                          setSelectedAppeal(ban);
                          setShowAppealModal(true);
                        }}
                        className="btn-primary px-4 py-2 flex items-center justify-center gap-2 flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Review
                      </button>
                    </div>
                  )}

                  {ban.appealStatus !== 'PENDING' && (
                    <div className={`px-4 py-2 rounded flex items-center gap-2 h-fit ${
                      ban.appealStatus === 'APPROVED'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-[#FF1A1A]/10 text-[#FF1A1A]'
                    }`}>
                      {ban.appealStatus === 'APPROVED'
                        ? <CheckCircle className="w-4 h-4" />
                        : <XCircle className="w-4 h-4" />
                      }
                      {ban.appealStatus}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20">
              <MessageSquare className="w-16 h-16 text-[#52525B] mx-auto mb-4" />
              <h3 className="text-xl font-['Rajdhani'] font-bold text-white mb-2">
                No Ban Appeals
              </h3>
              <p className="text-[#A1A1AA]">No players have submitted ban appeals yet</p>
            </div>
          )}
        </div>
      )}

      {/* Ban Modal */}
      <Modal
        isOpen={showBanModal}
        onClose={() => { setShowBanModal(false); setBanReason(''); }}
        title="Ban Player"
      >
        {selectedPlayer && (
          <div className="space-y-4">
            <div className="p-4 bg-[#FF1A1A]/10 border border-[#FF1A1A]/30 rounded flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF1A1A]" />
              <div>
                <p className="font-semibold text-white">{selectedPlayer.ign}</p>
                <p className="text-sm text-[#A1A1AA]">UID: {selectedPlayer.ffUid}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Ban Type</label>
              <select
                value={banType}
                onChange={(e) => setBanType(e.target.value)}
                className="input-dark w-full px-4 py-3 rounded"
              >
                {banTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Reason</label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="input-dark w-full px-4 py-3 rounded h-24 resize-none"
                placeholder="Enter ban reason..."
              />
            </div>

            {banType === 'PERMANENT' && (
              <div className="p-3 bg-[#FF1A1A]/20 rounded text-sm text-[#FF1A1A]">
                ⚠️ Warning: Permanent ban will also block the player's IP address
              </div>
            )}

            <button
              onClick={() => banMutation.mutate({ userId: selectedPlayer.id, banType, reason: banReason })}
              disabled={!banReason || banMutation.isPending}
              className="btn-primary w-full py-3 bg-[#FF1A1A] hover:bg-[#FF3333]"
            >
              {banMutation.isPending ? <LoadingSpinner size="sm" /> : 'Confirm Ban'}
            </button>
          </div>
        )}
      </Modal>

      {/* Appeal Review Modal */}
      <Modal
        isOpen={showAppealModal}
        onClose={() => { setShowAppealModal(false); setAppealNote(''); }}
        title="Review Ban Appeal"
      >
        {selectedAppeal && (
          <div className="space-y-4">
            {/* Player + Ban Info */}
            <div className="p-4 bg-white/5 rounded space-y-2">
              <div className="flex justify-between">
                <span className="text-[#A1A1AA] text-sm">Player</span>
                <span className="text-white font-semibold">{selectedAppeal.player?.ign}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA] text-sm">Ban Type</span>
                <span className="text-[#FF1A1A]">{banTypeLabels[selectedAppeal.banType]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA] text-sm">Reason</span>
                <span className="text-white text-sm max-w-xs text-right">{selectedAppeal.reason}</span>
              </div>
            </div>

            {/* Appeal Message */}
            <div className="p-4 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded">
              <p className="text-xs text-[#FF6B00] mb-2 font-semibold">PLAYER'S APPEAL:</p>
              <p className="text-white text-sm">{selectedAppeal.appealText}</p>
            </div>

            {/* Admin Note */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">
                Admin Note (shown to player if rejected)
              </label>
              <textarea
                value={appealNote}
                onChange={(e) => setAppealNote(e.target.value)}
                className="input-dark w-full px-4 py-3 rounded h-20 resize-none"
                placeholder="Optional note to the player..."
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => appealMutation.mutate({
                  banId: selectedAppeal.id,
                  action: 'APPROVED',
                  note: appealNote
                })}
                disabled={appealMutation.isPending}
                className="btn-primary py-3 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600"
              >
                {appealMutation.isPending ? <LoadingSpinner size="sm" /> : (
                  <><CheckCircle className="w-4 h-4" /> Approve</>
                )}
              </button>
              <button
                onClick={() => appealMutation.mutate({
                  banId: selectedAppeal.id,
                  action: 'REJECTED',
                  note: appealNote
                })}
                disabled={appealMutation.isPending}
                className="btn-secondary py-3 flex items-center justify-center gap-2 text-[#FF1A1A] border-[#FF1A1A] hover:bg-[#FF1A1A] hover:text-white"
              >
                {appealMutation.isPending ? <LoadingSpinner size="sm" /> : (
                  <><XCircle className="w-4 h-4" /> Reject</>
                )}
              </button>
            </div>

            <p className="text-xs text-[#52525B] text-center">
              Approving will immediately lift the ban and notify the player
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}