import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { MapPin, Users, Trophy, Clock, ChevronRight } from 'lucide-react';

const mapImages = {
  BERMUDA: 'https://images.unsplash.com/photo-1660509426337-e7075d7686ff?w=400&h=200&fit=crop',
  PURGATORY: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=400&h=200&fit=crop',
  KALAHARI: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=200&fit=crop',
  ALPHINE: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=200&fit=crop',
  NEXTERRA: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop',
  SOLARA: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=200&fit=crop',
};

const statusColors = {
  DRAFT: 'bg-[#52525B]',
  UPCOMING: 'bg-[#FF6B00]',
  REGISTERING: 'bg-[#FFD700] text-black',
  LIVE: 'bg-[#FF1A1A]',
  COMPLETED: 'bg-[#52525B]',
  CANCELLED: 'bg-[#FF1A1A]',
  POSTPONED: 'bg-[#FFD700] text-black',
};

export default function TournamentCard({ tournament, index = 0 }) {
  const slotsRemaining = tournament.maxTeams - tournament.filledSlots;
  const slotPercentage = (tournament.filledSlots / tournament.maxTeams) * 100;

  // Calculate total prize pool
  const totalPrize = Object.values(tournament.prizePool || {}).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="tournament-card rounded-lg overflow-hidden group"
      data-testid={`tournament-card-${tournament.id}`}
    >
      {/* Map Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={mapImages[tournament.map] || mapImages.BERMUDA}
          alt={tournament.map}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`badge ${statusColors[tournament.status]}`}>
            {tournament.status === 'LIVE' && <span className="live-dot mr-2" />}
            {tournament.status}
          </span>
        </div>

        {/* Entry Fee */}
        <div className="absolute top-3 right-3">
          <span className="badge bg-black/50 backdrop-blur-sm border border-white/20">
            ₹{tournament.entryFee}
          </span>
        </div>

        {/* Map Name */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-sm text-white/80">
          <MapPin className="w-4 h-4 text-[#FF6B00]" />
          {tournament.map}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-['Rajdhani'] font-bold text-white truncate">
          {tournament.name}
        </h3>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-[#A1A1AA]">
            <Clock className="w-4 h-4 text-[#FF6B00]" />
            <span>{format(new Date(tournament.scheduledAt), 'MMM d, h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2 text-[#A1A1AA]">
            <Trophy className="w-4 h-4 text-[#FFD700]" />
            <span>₹{totalPrize}</span>
          </div>
        </div>

        {/* Slots Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#A1A1AA] flex items-center gap-1">
              <Users className="w-4 h-4" />
              Slots
            </span>
            <span className={slotsRemaining <= 3 ? 'text-[#FF6B00]' : 'text-white'}>
              {tournament.filledSlots}/{tournament.maxTeams}
            </span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${slotPercentage}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            />
          </div>
          {slotsRemaining <= 3 && slotsRemaining > 0 && (
            <p className="text-xs text-[#FF6B00]">Only {slotsRemaining} slots left!</p>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/tournaments/${tournament.id}`}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          data-testid={`view-tournament-${tournament.id}`}
        >
          {tournament.status === 'REGISTERING' ? 'Register Now' : 'View Details'}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
