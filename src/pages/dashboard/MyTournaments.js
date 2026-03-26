import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Trophy, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Skeleton, Badge } from '../../components/UIComponents';

const statusConfig = {
  PAID: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  PENDING: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  REFUNDED: { icon: XCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  FAILED: { icon: XCircle, color: 'text-[#FF1A1A]', bg: 'bg-[#FF1A1A]/10' },
};

export default function MyTournaments() {
  const { token } = useAuth();

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['playerTournaments'],
    queryFn: () => api.getPlayerTournaments(token),
    enabled: !!token,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-['Rajdhani'] font-bold text-white mb-2">
          My Tournaments
        </h1>
        <p className="text-[#A1A1AA]">All your tournament registrations</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : tournaments?.length > 0 ? (
        <div className="space-y-4">
          {tournaments.map((item, index) => {
            const status = statusConfig[item.registration.paymentStatus];
            const StatusIcon = status?.icon || AlertCircle;

            return (
              <motion.div
                key={item.registration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-['Rajdhani'] font-bold text-white">
                          {item.tournament.name}
                        </h3>
                        <Badge variant={
                          item.tournament.status === 'LIVE' ? 'danger' :
                          item.tournament.status === 'REGISTERING' ? 'secondary' :
                          item.tournament.status === 'COMPLETED' ? 'default' :
                          'primary'
                        }>
                          {item.tournament.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-[#A1A1AA]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-[#FF6B00]" />
                          {item.tournament.map}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-[#FF6B00]" />
                          {format(new Date(item.tournament.scheduledAt), 'MMM d, yyyy • h:mm a')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-[#FFD700]" />
                          Entry: ₹{item.tournament.entryFee}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded ${status?.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${status?.color}`} />
                        <span className={status?.color}>
                          {item.registration.paymentStatus}
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-['Rajdhani'] font-bold text-[#FF6B00]">
                          #{item.registration.slotNumber}
                        </div>
                        <div className="text-xs text-[#A1A1AA]">Slot</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4">
                    <Link
                      to={`/tournaments/${item.tournament.id}`}
                      className="btn-secondary px-4 py-2 text-sm"
                    >
                      View Details
                    </Link>
                    {item.registration.paymentStatus === 'PAID' && ['UPCOMING', 'REGISTERING', 'LIVE'].includes(item.tournament.status) && (
                      <Link
                        to={`/tournaments/${item.tournament.id}`}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        Check Room ID
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <Trophy className="w-16 h-16 text-[#52525B] mx-auto mb-4" />
          <h3 className="text-xl font-['Rajdhani'] font-bold text-white mb-2">
            No Tournaments Yet
          </h3>
          <p className="text-[#A1A1AA] mb-6">
            You haven't registered for any tournaments yet
          </p>
          <Link to="/tournaments" className="btn-primary px-6 py-3 inline-block">
            Browse Tournaments
          </Link>
        </div>
      )}
    </div>
  );
}
