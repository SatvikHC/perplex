import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Medal, Crown, Sword, Wallet, Gamepad2, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Skeleton, PageTransition } from '../components/UIComponents';
import { api } from '../lib/api';

const periods = [
  { value: 'all', label: '🏆 All Time' },
  { value: 'monthly', label: '📅 Monthly' },
  { value: 'weekly', label: '⚡ Weekly' },
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState('all');

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => api.getLeaderboard(period),
    refetchInterval: 60000,
  });

  const top3 = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];

  const podiumOrder = [1, 0, 2]; // Silver, Gold, Bronze display order

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block"
              >
                <Trophy className="w-16 h-16 text-[#FFD700] mx-auto mb-4" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-['Rajdhani'] font-bold text-white mb-2">
                Leaderboard
              </h1>
              <p className="text-[#A1A1AA] text-lg">
                Top teams across all OSG LIVE tournaments
              </p>
            </div>

            {/* Period Filter */}
            <div className="flex justify-center gap-3 mb-10">
              {periods.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-6 py-3 rounded-lg font-['Rajdhani'] font-semibold text-base transition-all ${
                    period === p.value
                      ? 'bg-[#FF6B00] text-black shadow-lg shadow-[#FF6B00]/30'
                      : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
              </div>
            ) : leaderboard?.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={period}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Podium — Top 3 */}
                  {top3.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-8 items-end">
                      {podiumOrder.map((idx) => {
                        const player = top3[idx];
                        if (!player) return <div key={idx} />;
                        const rank = idx + 1;
                        const isGold = rank === 1;
                        const isSilver = rank === 2;
                        const isBronze = rank === 3;

                        return (
                          <motion.div
                            key={player.teamName}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`glass-card rounded-xl p-5 text-center relative overflow-hidden border ${
                              isGold ? 'border-[#FFD700]/60 mb-0' :
                              isSilver ? 'border-gray-400/40 mb-4' :
                              'border-orange-600/40 mb-8'
                            }`}
                          >
                            {/* Glow */}
                            <div className={`absolute inset-0 opacity-10 ${
                              isGold ? 'bg-[#FFD700]' : isSilver ? 'bg-gray-400' : 'bg-orange-600'
                            }`} />

                            <div className="relative z-10">
                              {/* Rank icon */}
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl ${
                                isGold ? 'bg-[#FFD700]/20' : isSilver ? 'bg-gray-400/20' : 'bg-orange-600/20'
                              }`}>
                                {isGold ? '🥇' : isSilver ? '🥈' : '🥉'}
                              </div>

                              <div className={`text-3xl font-['Rajdhani'] font-bold mb-1 ${
                                isGold ? 'text-[#FFD700]' : isSilver ? 'text-gray-300' : 'text-orange-400'
                              }`}>
                                #{rank}
                              </div>

                              <h3 className="text-lg font-bold text-white mb-1 truncate">{player.teamName}</h3>
                              <p className="text-sm text-[#A1A1AA] mb-4 flex items-center justify-center gap-1">
                                <Gamepad2 className="w-3 h-3" />{player.captainIgn}
                              </p>

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-white/5 rounded p-2">
                                  <div className="text-[#FF6B00] font-bold text-lg">{player.totalKills}</div>
                                  <div className="text-[#52525B] text-xs">Kills</div>
                                </div>
                                <div className="bg-white/5 rounded p-2">
                                  <div className="text-[#FFD700] font-bold text-lg">{player.totalPoints}</div>
                                  <div className="text-[#52525B] text-xs">Points</div>
                                </div>
                                <div className="bg-white/5 rounded p-2">
                                  <div className="text-green-400 font-bold text-lg">{player.totalWins}</div>
                                  <div className="text-[#52525B] text-xs">Wins 🏆</div>
                                </div>
                                <div className="bg-white/5 rounded p-2">
                                  <div className="text-blue-400 font-bold text-lg">{player.matchesPlayed}</div>
                                  <div className="text-[#52525B] text-xs">Matches</div>
                                </div>
                              </div>

                              {player.totalEarnings > 0 && (
                                <div className="mt-3 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded p-2">
                                  <p className="text-[#FFD700] font-bold text-sm">₹{player.totalEarnings.toFixed(0)} earned</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Rest of leaderboard */}
                  {rest.length > 0 && (
                    <div className="glass-card rounded-xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                        <h2 className="font-['Rajdhani'] font-bold text-white text-lg flex items-center gap-2">
                          <Users className="w-5 h-5 text-[#FF6B00]" />
                          Full Rankings
                        </h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/3">
                              <th className="px-4 py-3 text-left text-xs text-[#A1A1AA] uppercase">Rank</th>
                              <th className="px-4 py-3 text-left text-xs text-[#A1A1AA] uppercase">Team</th>
                              <th className="px-4 py-3 text-left text-xs text-[#A1A1AA] uppercase">Captain</th>
                              <th className="px-4 py-3 text-center text-xs text-[#FF6B00] uppercase">
                                <div className="flex items-center justify-center gap-1"><Sword className="w-3 h-3" />Kills</div>
                              </th>
                              <th className="px-4 py-3 text-center text-xs text-green-400 uppercase">Wins</th>
                              <th className="px-4 py-3 text-center text-xs text-[#A1A1AA] uppercase">Matches</th>
                              <th className="px-4 py-3 text-center text-xs text-blue-400 uppercase">
                                <div className="flex items-center justify-center gap-1"><Wallet className="w-3 h-3" />Earned</div>
                              </th>
                              <th className="px-4 py-3 text-center text-xs text-[#FFD700] uppercase font-bold">Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rest.map((player, index) => (
                              <motion.tr
                                key={player.teamName}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                              >
                                <td className="px-4 py-4">
                                  <span className="font-['Rajdhani'] font-bold text-[#A1A1AA] text-lg">
                                    #{index + 4}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="text-white font-semibold">{player.teamName}</span>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-1 text-[#A1A1AA]">
                                    <Gamepad2 className="w-3 h-3" />
                                    {player.captainIgn}
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className="text-[#FF6B00] font-bold">{player.totalKills}</span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className="text-green-400 font-bold">{player.totalWins}</span>
                                </td>
                                <td className="px-4 py-4 text-center text-[#A1A1AA]">
                                  {player.matchesPlayed}
                                </td>
                                <td className="px-4 py-4 text-center">
                                  {player.totalEarnings > 0 ? (
                                    <span className="text-blue-400 font-bold">₹{player.totalEarnings.toFixed(0)}</span>
                                  ) : (
                                    <span className="text-[#52525B]">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className="text-[#FFD700] font-['Rajdhani'] font-bold text-lg">
                                    {player.totalPoints}
                                  </span>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="text-center py-24">
                <Target className="w-20 h-20 text-[#52525B] mx-auto mb-4" />
                <h3 className="text-2xl font-['Rajdhani'] font-bold text-white mb-2">
                  No Rankings Yet
                </h3>
                <p className="text-[#A1A1AA] mb-2">
                  Complete tournaments to appear on the leaderboard
                </p>
                <p className="text-[#52525B] text-sm">
                  Leaderboard updates after each match result is saved by admin
                </p>
              </div>
            )}

            {/* How it works */}
            <div className="mt-12 glass-card rounded-xl p-6 border border-white/10">
              <h3 className="font-['Rajdhani'] font-bold text-white text-lg mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FF6B00]" />
                How Points Are Calculated
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-[#FFD700] font-bold mb-2 flex items-center gap-2">
                    <Crown className="w-4 h-4" /> Placement Points
                  </div>
                  <div className="text-[#A1A1AA] space-y-1">
                    <p>🥇 1st Place = 12 pts</p>
                    <p>🥈 2nd Place = 9 pts</p>
                    <p>🥉 3rd Place = 8 pts</p>
                    <p>4th = 7 · 5th = 6 · 6th = 5</p>
                    <p>7th = 4 · 8th = 3 · 9th = 2</p>
                    <p>10th = 1 · 11th-12th = 0</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-[#FF6B00] font-bold mb-2 flex items-center gap-2">
                    <Sword className="w-4 h-4" /> Kill Points
                  </div>
                  <div className="text-[#A1A1AA] space-y-1">
                    <p>1 Kill = 1 Point</p>
                    <p>Kill points stack across all matches</p>
                    <p>More kills = higher rank on tiebreaker</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-green-400 font-bold mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Total Score
                  </div>
                  <div className="text-[#A1A1AA] space-y-1">
                    <p>Total = Placement Pts + Kill Pts</p>
                    <p>Across all 6 matches per tournament</p>
                    <p>Tiebreaker = Total Kills</p>
                    <p>Global leaderboard = all tournaments combined</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}