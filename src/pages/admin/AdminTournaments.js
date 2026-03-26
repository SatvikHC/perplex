import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Plus, Trophy, MapPin, Clock, Users, Eye, Edit,
  ChevronRight, Trash2, FlaskConical, UserPlus, Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Skeleton, Badge } from '../../components/UIComponents';

const statusColors = {
  DRAFT: 'default',
  UPCOMING: 'primary',
  REGISTERING: 'secondary',
  LIVE: 'danger',
  COMPLETED: 'default',
  CANCELLED: 'danger',
  POSTPONED: 'warning',
};

export default function AdminTournaments() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [seeding, setSeeding] = useState(null);

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => api.getTournaments(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteTournament(id, token),
    onSuccess: (_, id) => {
      toast.success('Tournament deleted!');
      queryClient.invalidateQueries(['tournaments']);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSeedTest = async (action) => {
    setSeeding(action);
    try {
      let result;
      if (action === 'tournament') result = await api.seedTestTournament();
      else if (action === 'delete-tournament') result = await api.deleteTestTournament();
      else if (action === 'users') result = await api.seedTestUsers();
      else if (action === 'delete-users') result = await api.deleteTestUsers();
      toast.success(result.message);
      queryClient.invalidateQueries(['tournaments']);
    } catch (e) {
      toast.error(e.message || 'Failed');
    } finally {
      setSeeding(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-['Rajdhani'] font-bold text-white mb-2">Tournaments</h1>
            <p className="text-[#A1A1AA]">Manage all tournaments</p>
          </div>
          <Link to="/admin/tournaments/create" className="btn-primary px-6 py-3 flex items-center gap-2">
            <Plus className="w-5 h-5" />Create Tournament
          </Link>
        </div>

        {/* Test Seed Controls */}
        <div className="glass-card rounded-lg p-4 border border-yellow-500/20">
          <p className="text-yellow-500 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1">
            <FlaskConical className="w-3 h-3" /> Test / Dev Tools
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleSeedTest('tournament')} disabled={!!seeding}
              className="px-3 py-2 bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] rounded text-xs hover:bg-[#FF6B00]/20 flex items-center gap-1">
              {seeding === 'tournament' ? <Loader className="w-3 h-3 animate-spin" /> : <FlaskConical className="w-3 h-3" />}
              Create Test Tournament (12 teams)
            </button>
            <button onClick={() => handleSeedTest('delete-tournament')} disabled={!!seeding}
              className="px-3 py-2 bg-[#FF1A1A]/10 border border-[#FF1A1A]/30 text-[#FF1A1A] rounded text-xs hover:bg-[#FF1A1A]/20 flex items-center gap-1">
              {seeding === 'delete-tournament' ? <Loader className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Delete Test Tournament
            </button>
            <button onClick={() => handleSeedTest('users')} disabled={!!seeding}
              className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded text-xs hover:bg-blue-500/20 flex items-center gap-1">
              {seeding === 'users' ? <Loader className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
              Create 12 Test Users
            </button>
            <button onClick={() => handleSeedTest('delete-users')} disabled={!!seeding}
              className="px-3 py-2 bg-red-900/20 border border-red-500/30 text-red-400 rounded text-xs hover:bg-red-500/20 flex items-center gap-1">
              {seeding === 'delete-users' ? <Loader className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Delete Test Users
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : tournaments?.length > 0 ? (
        <div className="space-y-4">
          {tournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-lg p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-['Rajdhani'] font-bold text-white">
                      {tournament.name}
                    </h3>
                    <Badge variant={statusColors[tournament.status]}>
                      {tournament.status === 'LIVE' && <span className="live-dot mr-2" />}
                      {tournament.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-[#A1A1AA]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#FF6B00]" />
                      {tournament.map}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#FF6B00]" />
                      {format(new Date(tournament.scheduledAt), 'MMM d, yyyy • h:mm a')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#FF6B00]" />
                      {tournament.filledSlots}/{tournament.maxTeams} teams
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-[#FFD700]" />
                      ₹{tournament.entryFee} entry
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/tournaments/${tournament.id}`} className="btn-ghost px-3 py-2 flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4" />View
                  </Link>
                  <Link to={`/admin/tournaments/${tournament.id}`} className="btn-primary px-3 py-2 flex items-center gap-2 text-sm">
                    <Edit className="w-4 h-4" />Manage
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${tournament.name}"? This cannot be undone.`))
                        deleteMutation.mutate(tournament.id);
                    }}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-2 bg-[#FF1A1A]/10 border border-[#FF1A1A]/30 text-[#FF1A1A] rounded hover:bg-[#FF1A1A] hover:text-white transition-all text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar for slots */}
              <div className="mt-4">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FFD700]"
                    style={{ width: `${(tournament.filledSlots / tournament.maxTeams) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Trophy className="w-16 h-16 text-[#52525B] mx-auto mb-4" />
          <h3 className="text-xl font-['Rajdhani'] font-bold text-white mb-2">
            No Tournaments Yet
          </h3>
          <p className="text-[#A1A1AA] mb-6">
            Create your first tournament to get started
          </p>
          <Link to="/admin/tournaments/create" className="btn-primary px-6 py-3 inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Tournament
          </Link>
        </div>
      )}
    </div>
  );
}