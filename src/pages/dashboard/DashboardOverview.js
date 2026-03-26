import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Trophy, Target, TrendingUp, Wallet, ChevronRight,
  Clock, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Skeleton, Countdown } from '../../components/UIComponents';

export default function DashboardOverview() {
  const { user, token } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['playerProfile'],
    queryFn: () => api.getPlayerProfile(token),
    enabled: !!token,
  });

  const { data: tournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['playerTournaments'],
    queryFn: () => api.getPlayerTournaments(token),
    enabled: !!token,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(token),
    enabled: !!token,
  });

  const upcomingTournaments = tournaments?.filter(
    t => ['UPCOMING', 'REGISTERING', 'LIVE'].includes(t.tournament.status)
  ) || [];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-['Rajdhani'] font-bold text-white mb-2">
          Welcome back, {user?.ign}!
        </h1>
        <p className="text-[#A1A1AA]">Here's your gaming overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {profileLoading ? (
          [1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-lg p-6"
            >
              <Trophy className="w-8 h-8 text-[#FFD700] mb-3" />
              <div className="text-2xl font-['Rajdhani'] font-bold text-white">
                {profile?.stats?.tournamentsPlayed || 0}
              </div>
              <p className="text-sm text-[#A1A1AA]">Tournaments Played</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-lg p-6"
            >
              <Target className="w-8 h-8 text-[#FF6B00] mb-3" />
              <div className="text-2xl font-['Rajdhani'] font-bold text-white">
                {profile?.stats?.totalKills || 0}
              </div>
              <p className="text-sm text-[#A1A1AA]">Total Kills</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-lg p-6"
            >
              <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
              <div className="text-2xl font-['Rajdhani'] font-bold text-white">
                {profile?.stats?.totalWins || 0}
              </div>
              <p className="text-sm text-[#A1A1AA]">Total Wins</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-lg p-6"
            >
              <Wallet className="w-8 h-8 text-[#FFD700] mb-3" />
              <div className="text-2xl font-['Rajdhani'] font-bold text-white">
                ₹{profile?.stats?.totalEarnings || 0}
              </div>
              <p className="text-sm text-[#A1A1AA]">Total Earnings</p>
            </motion.div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Tournaments */}
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-['Rajdhani'] font-bold text-white">
              Upcoming Matches
            </h2>
            <Link to="/dashboard/tournaments" className="text-[#FF6B00] text-sm hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {tournamentsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : upcomingTournaments.length > 0 ? (
            <div className="space-y-4">
              {upcomingTournaments.slice(0, 3).map((item, index) => (
                <motion.div
                  key={item.registration.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{item.tournament.name}</h3>
                    <span className="badge badge-upcoming">Slot #{item.registration.slotNumber}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#A1A1AA]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(item.tournament.scheduledAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  {['UPCOMING', 'REGISTERING'].includes(item.tournament.status) && (
                    <div className="mt-3">
                      <Countdown targetDate={item.tournament.scheduledAt} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-[#52525B] mx-auto mb-3" />
              <p className="text-[#A1A1AA] mb-4">No upcoming tournaments</p>
              <Link to="/tournaments" className="btn-primary px-6 py-2 inline-block">
                Browse Tournaments
              </Link>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-['Rajdhani'] font-bold text-white">
              Notifications
            </h2>
            <Bell className="w-5 h-5 text-[#A1A1AA]" />
          </div>

          {notifications?.length > 0 ? (
            <div className="space-y-4">
              {notifications.slice(0, 5).map((notif, index) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    notif.type === 'SUCCESS' ? 'border-green-500 bg-green-500/5' :
                    notif.type === 'DANGER' ? 'border-[#FF1A1A] bg-[#FF1A1A]/5' :
                    notif.type === 'WARNING' ? 'border-[#FFD700] bg-[#FFD700]/5' :
                    'border-[#FF6B00] bg-white/5'
                  } ${!notif.isRead ? 'opacity-100' : 'opacity-60'}`}
                >
                  <p className="font-semibold text-white text-sm">{notif.title}</p>
                  <p className="text-xs text-[#A1A1AA] mt-1">{notif.message}</p>
                  <p className="text-xs text-[#52525B] mt-2">
                    {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-[#52525B] mx-auto mb-3" />
              <p className="text-[#A1A1AA]">No notifications yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-lg p-6">
        <h2 className="text-xl font-['Rajdhani'] font-bold text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/tournaments" className="btn-primary py-4 text-center">
            Browse Tournaments
          </Link>
          <Link to="/dashboard/team" className="btn-secondary py-4 text-center">
            Manage Team
          </Link>
          <Link to="/dashboard/wallet" className="btn-secondary py-4 text-center">
            Withdraw Funds
          </Link>
          <Link to="/leaderboard" className="btn-secondary py-4 text-center">
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
