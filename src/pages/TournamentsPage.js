import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Filter, Search, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TournamentCard from '../components/TournamentCard';
import { Skeleton, PageTransition } from '../components/UIComponents';
import { api } from '../lib/api';

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'REGISTERING', label: 'Registering' },
  { value: 'LIVE', label: 'Live 🔴' },
  { value: 'COMPLETED', label: 'Completed' },
];

const MODE_LABELS = {
  BR: '🏆 Battle Royale',
  CS_4v4: '⚔️ Clash Squad 4v4',
  CS_2v2: '🤝 Clash Squad 2v2',
  CS_1v1: '🎯 Clash Squad 1v1',
  LW_1v1: '🐺 Lone Wolf 1v1',
  LW_2v2: '🦅 Lone Wolf 2v2',
};

const MODE_COLORS = {
  BR: 'bg-orange-500/20 text-orange-400',
  CS_4v4: 'bg-red-500/20 text-red-400',
  CS_2v2: 'bg-purple-500/20 text-purple-400',
  CS_1v1: 'bg-blue-500/20 text-blue-400',
  LW_1v1: 'bg-green-500/20 text-green-400',
  LW_2v2: 'bg-yellow-500/20 text-yellow-400',
};

const mapOptions = [
  { value: '', label: 'All Maps' },
  { value: 'BERMUDA', label: 'Bermuda' },
  { value: 'PURGATORY', label: 'Purgatory' },
  { value: 'KALAHARI', label: 'Kalahari' },
  { value: 'ALPHINE', label: 'Alphine' },
  { value: 'NEXTERRA', label: 'Nexterra' },
  { value: 'SOLARA', label: 'Solara' },
];

const feeOptions = [
  { value: '', label: 'Any Fee' },
  { value: '30', label: '₹30' },
  { value: '40', label: '₹40' },
  { value: '50', label: '₹50' },
  { value: '60', label: '₹60' },
  { value: '70', label: '₹70' },
  { value: '80', label: '₹80' },
];

export default function TournamentsPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    map: '',
    fee: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments', filters],
    queryFn: () => api.getTournaments({
      status: filters.status !== 'all' ? filters.status : undefined,
      map: filters.map || undefined,
      minFee: filters.fee || undefined,
      maxFee: filters.fee || undefined,
    }),
  });

  const activeFiltersCount = [
    filters.status !== 'all',
    filters.map,
    filters.fee,
  ].filter(Boolean).length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-['Rajdhani'] font-bold text-white mb-2">
                Tournaments
              </h1>
              <p className="text-[#A1A1AA]">
                Browse and register for upcoming Free Fire tournaments
              </p>
            </div>

            {/* Filters */}
            <div className="mb-8">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden btn-secondary w-full py-3 flex items-center justify-center gap-2 mb-4"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-[#FF6B00] text-black text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Filter Bar */}
              <motion.div
                initial={false}
                animate={{ height: showFilters ? 'auto' : 0 }}
                className="md:!h-auto overflow-hidden"
              >
                <div className="glass-card rounded-lg p-4 md:p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Status Filter */}
                    <div className="flex-1">
                      <label className="block text-sm text-[#A1A1AA] mb-2">Status</label>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => setFilters({ ...filters, status: option.value })}
                            className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                              filters.status === option.value
                                ? 'bg-[#FF6B00] text-black'
                                : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Map Filter */}
                    <div className="w-full md:w-48">
                      <label className="block text-sm text-[#A1A1AA] mb-2">Map</label>
                      <select
                        value={filters.map}
                        onChange={(e) => setFilters({ ...filters, map: e.target.value })}
                        className="input-dark w-full px-4 py-2 rounded"
                        data-testid="filter-map"
                      >
                        {mapOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fee Filter */}
                    <div className="w-full md:w-48">
                      <label className="block text-sm text-[#A1A1AA] mb-2">Entry Fee</label>
                      <select
                        value={filters.fee}
                        onChange={(e) => setFilters({ ...filters, fee: e.target.value })}
                        className="input-dark w-full px-4 py-2 rounded"
                        data-testid="filter-fee"
                      >
                        {feeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Clear Filters */}
                    {activeFiltersCount > 0 && (
                      <div className="flex items-end">
                        <button
                          onClick={() => setFilters({ status: 'all', map: '', fee: '' })}
                          className="text-[#A1A1AA] hover:text-white flex items-center gap-1 text-sm"
                        >
                          <X className="w-4 h-4" />
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Always visible on desktop */}
              <div className="hidden md:block">
                {/* Content above is already visible */}
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="glass-card rounded-lg overflow-hidden">
                    <Skeleton className="h-40" />
                    <div className="p-4 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tournaments?.length > 0 ? (
              <>
                <p className="text-[#A1A1AA] text-sm mb-6">
                  Showing {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tournaments.map((tournament, index) => (
                    <TournamentCard key={tournament.id} tournament={tournament} index={index} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-[#52525B] mx-auto mb-4" />
                <h3 className="text-xl font-['Rajdhani'] font-bold text-white mb-2">
                  No Tournaments Found
                </h3>
                <p className="text-[#A1A1AA] mb-6">
                  Try adjusting your filters to find more tournaments
                </p>
                <button
                  onClick={() => setFilters({ status: 'all', map: '', fee: '' })}
                  className="btn-secondary px-6 py-3"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}