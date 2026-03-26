import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Users, UserPlus, Crown, Trash2, LogOut, Search, 
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Skeleton, Modal, LoadingSpinner } from '../../components/UIComponents';

export default function MyTeam() {
  const { user, token, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [inviteUid, setInviteUid] = useState('');

  const { data: team, isLoading } = useQuery({
    queryKey: ['myTeam'],
    queryFn: () => api.getMyTeam(token),
    enabled: !!token,
  });

  const { data: pendingInvites } = useQuery({
    queryKey: ['pendingInvites'],
    queryFn: () => api.getPendingInvites(token),
    enabled: !!token,
  });

  const createTeamMutation = useMutation({
    mutationFn: (name) => api.createTeam(name, token),
    onSuccess: () => {
      toast.success('Team created!');
      queryClient.invalidateQueries(['myTeam']);
      setShowCreateModal(false);
      setTeamName('');
    },
    onError: (err) => toast.error(err.message),
  });

  const inviteMutation = useMutation({
    mutationFn: (ffUid) => api.inviteToTeam(ffUid, token),
    onSuccess: () => {
      toast.success('Invitation sent!');
      queryClient.invalidateQueries(['myTeam']);
      setShowInviteModal(false);
      setInviteUid('');
    },
    onError: (err) => toast.error(err.message),
  });

  const acceptInviteMutation = useMutation({
    mutationFn: (teamId) => api.acceptInvite(teamId, token),
    onSuccess: () => {
      toast.success('Joined team!');
      queryClient.invalidateQueries(['myTeam', 'pendingInvites']);
      refreshUser();
    },
    onError: (err) => toast.error(err.message),
  });

  const leaveTeamMutation = useMutation({
    mutationFn: () => api.leaveTeam(token),
    onSuccess: () => {
      toast.success('Left team');
      queryClient.invalidateQueries(['myTeam']);
      refreshUser();
    },
    onError: (err) => toast.error(err.message),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => api.removeMember(memberId, token),
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries(['myTeam']);
    },
    onError: (err) => toast.error(err.message),
  });

  const isCaptain = team?.captainId === user?.id;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-['Rajdhani'] font-bold text-white mb-2">
          My Team
        </h1>
        <p className="text-[#A1A1AA]">Manage your squad</p>
      </div>

      {/* Pending Invites */}
      {pendingInvites?.length > 0 && (
        <div className="glass-card rounded-lg p-6 border-2 border-[#FFD700]/30">
          <h2 className="text-xl font-['Rajdhani'] font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FFD700]" />
            Pending Invitations
          </h2>
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 bg-white/5 rounded">
                <div>
                  <p className="font-semibold text-white">{invite.name}</p>
                  <p className="text-sm text-[#A1A1AA]">Team invitation</p>
                </div>
                <button
                  onClick={() => acceptInviteMutation.mutate(invite.id)}
                  disabled={acceptInviteMutation.isPending}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  {acceptInviteMutation.isPending ? <LoadingSpinner size="sm" /> : 'Accept'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {team ? (
        <div className="glass-card rounded-lg p-6">
          {/* Team Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#FF6B00] rounded-lg flex items-center justify-center text-black font-bold text-2xl">
                {team.name[0]}
              </div>
              <div>
                <h2 className="text-2xl font-['Rajdhani'] font-bold text-white">{team.name}</h2>
                <p className="text-[#A1A1AA]">{team.memberDetails?.length || 0}/4 members</p>
              </div>
            </div>
            {isCaptain && team.memberDetails?.length < 4 && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="btn-primary px-4 py-2 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </button>
            )}
          </div>

          {/* Members List */}
          <div className="space-y-3">
            {team.memberDetails?.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-[#FF6B00] font-bold">
                    {member.ign[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{member.ign}</span>
                      {member.isCaptain && (
                        <Crown className="w-4 h-4 text-[#FFD700]" />
                      )}
                    </div>
                    <p className="text-sm text-[#A1A1AA]">UID: {member.ffUid}</p>
                  </div>
                </div>

                {isCaptain && !member.isCaptain && (
                  <button
                    onClick={() => removeMemberMutation.mutate(member.id)}
                    disabled={removeMemberMutation.isPending}
                    className="text-[#FF1A1A] hover:bg-[#FF1A1A]/10 p-2 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: 4 - (team.memberDetails?.length || 0) }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border-2 border-dashed border-white/10 rounded-lg"
              >
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#52525B]" />
                </div>
                <span className="text-[#52525B]">Empty Slot</span>
              </div>
            ))}
          </div>

          {/* Leave Team */}
          {!isCaptain && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to leave this team?')) {
                  leaveTeamMutation.mutate();
                }
              }}
              disabled={leaveTeamMutation.isPending}
              className="mt-6 text-[#FF1A1A] hover:underline flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Leave Team
            </button>
          )}

          {/* Team Status */}
          {team.memberDetails?.length === 4 && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-400">Team is complete and ready for tournaments!</p>
            </div>
          )}

          {team.memberDetails?.length < 4 && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <p className="text-yellow-400">You need 4 members to register for tournaments</p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-lg p-12 text-center">
          <Users className="w-16 h-16 text-[#52525B] mx-auto mb-4" />
          <h2 className="text-2xl font-['Rajdhani'] font-bold text-white mb-2">
            No Team Yet
          </h2>
          <p className="text-[#A1A1AA] mb-6">
            Create a team or wait for an invitation to join one
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-8 py-3"
          >
            Create Team
          </button>
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Team"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="input-dark w-full px-4 py-3 rounded"
              placeholder="Enter team name"
              maxLength={30}
            />
          </div>
          <button
            onClick={() => createTeamMutation.mutate(teamName)}
            disabled={!teamName || createTeamMutation.isPending}
            className="btn-primary w-full py-3"
          >
            {createTeamMutation.isPending ? <LoadingSpinner size="sm" /> : 'Create Team'}
          </button>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Player"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Free Fire UID</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
              <input
                type="text"
                value={inviteUid}
                onChange={(e) => setInviteUid(e.target.value)}
                className="input-dark w-full pl-12 pr-4 py-3 rounded"
                placeholder="Enter player's FF UID"
              />
            </div>
          </div>
          <button
            onClick={() => inviteMutation.mutate(inviteUid)}
            disabled={!inviteUid || inviteMutation.isPending}
            className="btn-primary w-full py-3"
          >
            {inviteMutation.isPending ? <LoadingSpinner size="sm" /> : 'Send Invitation'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
