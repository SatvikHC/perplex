import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Flame, Trophy, Users, Gamepad2, ChevronRight, 
  Shield, Wallet, Target, Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TournamentCard from '../components/TournamentCard';
import { 
  FireParticles, AnimatedCounter, GlitchText, 
  LiveTicker, Skeleton, PageTransition 
} from '../components/UIComponents';
import { api } from '../lib/api';

export default function LandingPage() {
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['featuredTournaments'],
    queryFn: api.getFeaturedTournaments,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['globalStats'],
    queryFn: api.getGlobalStats,
  });

  // Seed database on first load
  useEffect(() => {
    api.seedDatabase().catch(() => {});
  }, []);

  const tickerItems = tournaments?.slice(0, 4).map(t => ({
    title: t.name,
    description: `${t.filledSlots}/${t.maxTeams} slots filled • ₹${t.entryFee} entry`
  })) || [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/976862/pexels-photo-976862.jpeg?auto=compress&cs=tinysrgb&w=1920"
              alt="Esports Arena"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-[#0A0A0A]" />
          </div>

          {/* Fire Particles */}
          <div className="fire-particles">
            <FireParticles />
          </div>

          {/* Grid Overlay */}
          <div className="absolute inset-0 grid-overlay opacity-50" />

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Logo */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Flame className="w-16 h-16 md:w-24 md:h-24 text-[#FF6B00]" />
                </motion.div>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-['Rajdhani'] font-bold mb-6">
                <GlitchText className="gradient-text">OSG LIVE</GlitchText>
              </h1>
              <p className="text-xl md:text-2xl text-[#A1A1AA] max-w-2xl mx-auto mb-8">
                WHERE LEGENDS ARE MADE
              </p>
              <p className="text-lg text-[#52525B] max-w-xl mx-auto mb-12">
                India's Premier Free Fire Esports Tournament Platform
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/tournaments"
                  className="btn-primary px-8 py-4 text-lg inline-flex items-center justify-center gap-2"
                  data-testid="hero-join-tournament"
                >
                  <Gamepad2 className="w-5 h-5" />
                  JOIN TOURNAMENT
                </Link>
                <Link
                  to="/tournaments"
                  className="btn-secondary px-8 py-4 text-lg inline-flex items-center justify-center gap-2"
                  data-testid="hero-view-schedule"
                >
                  VIEW SCHEDULE
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-6 h-10 border-2 border-[#FF6B00] rounded-full p-1">
                <div className="w-2 h-2 bg-[#FF6B00] rounded-full mx-auto animate-bounce" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Live Ticker */}
        {tickerItems.length > 0 && <LiveTicker items={tickerItems} />}

        {/* Stats Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-lg p-8 text-center"
              >
                <Trophy className="w-12 h-12 text-[#FFD700] mx-auto mb-4" />
                <div className="text-4xl md:text-5xl font-['Rajdhani'] font-bold text-white mb-2">
                  <AnimatedCounter value={stats?.totalTournaments || 0} suffix="+" />
                </div>
                <p className="text-[#A1A1AA] uppercase tracking-wider text-sm">
                  Tournaments Held
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-lg p-8 text-center"
              >
                <Users className="w-12 h-12 text-[#FF6B00] mx-auto mb-4" />
                <div className="text-4xl md:text-5xl font-['Rajdhani'] font-bold text-white mb-2">
                  <AnimatedCounter value={stats?.totalPlayers || 0} suffix="+" />
                </div>
                <p className="text-[#A1A1AA] uppercase tracking-wider text-sm">
                  Players Registered
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-lg p-8 text-center"
              >
                <Wallet className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <div className="text-4xl md:text-5xl font-['Rajdhani'] font-bold text-white mb-2">
                  <AnimatedCounter value={stats?.totalPrizeDistributed || 0} prefix="₹" />
                </div>
                <p className="text-[#A1A1AA] uppercase tracking-wider text-sm">
                  Prize Distributed
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Tournaments */}
        <section className="py-20 bg-[#121212]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-['Rajdhani'] font-bold text-white">
                  Featured Tournaments
                </h2>
                <p className="text-[#A1A1AA] mt-2">Join the battle and compete for glory</p>
              </div>
              <Link
                to="/tournaments"
                className="btn-secondary px-6 py-3 hidden sm:flex items-center gap-2"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {tournamentsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card rounded-lg overflow-hidden">
                    <Skeleton className="h-40" />
                    <div className="p-4 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tournaments?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.slice(0, 6).map((tournament, index) => (
                  <TournamentCard key={tournament.id} tournament={tournament} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Flame className="w-16 h-16 text-[#52525B] mx-auto mb-4" />
                <p className="text-[#A1A1AA]">No tournaments available right now</p>
                <p className="text-[#52525B] text-sm mt-2">Check back soon for new battles!</p>
              </div>
            )}

            <Link
              to="/tournaments"
              className="btn-secondary px-6 py-3 mt-8 mx-auto sm:hidden flex items-center justify-center gap-2"
            >
              View All Tournaments
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-['Rajdhani'] font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-[#A1A1AA] max-w-2xl mx-auto">
                Get started in 3 simple steps and compete for real prizes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  step: '01',
                  title: 'Register & Form Team',
                  description: 'Create your account, verify your Free Fire UID, and form a 4-player squad'
                },
                {
                  icon: Wallet,
                  step: '02',
                  title: 'Pay & Get Slot',
                  description: 'Choose a tournament, pay the entry fee, and secure your slot instantly'
                },
                {
                  icon: Trophy,
                  step: '03',
                  title: 'Play & Win Prize',
                  description: 'Join the match, dominate the battlefield, and win real cash prizes'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-lg p-8 relative group hover:border-[#FF6B00]/50 transition-colors"
                >
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#FF6B00] flex items-center justify-center font-['Rajdhani'] font-bold text-black text-xl">
                    {item.step}
                  </div>
                  <item.icon className="w-12 h-12 text-[#FF6B00] mb-6" />
                  <h3 className="text-xl font-['Rajdhani'] font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[#A1A1AA]">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-[#121212]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-['Rajdhani'] font-bold text-white mb-6">
                  Why Choose OSG LIVE?
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      icon: Shield,
                      title: 'Secure Payments',
                      description: 'Razorpay & Cashfree powered payments with instant confirmation'
                    },
                    {
                      icon: Zap,
                      title: 'Instant Withdrawals',
                      description: 'Withdraw your winnings directly to UPI within 24 hours'
                    },
                    {
                      icon: Target,
                      title: 'Fair Play',
                      description: 'Anti-cheat monitoring and strict ban enforcement'
                    },
                    {
                      icon: Trophy,
                      title: 'Real Prizes',
                      description: 'Win real money from prize pools + per-kill bonuses'
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="w-12 h-12 bg-[#FF6B00]/10 rounded flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-[#FF6B00]" />
                      </div>
                      <div>
                        <h3 className="font-['Rajdhani'] font-bold text-white mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-[#A1A1AA] text-sm">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-video rounded-lg overflow-hidden glass-card">
                  <img
                    src="https://images.pexels.com/photos/7773979/pexels-photo-7773979.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Gaming"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-[#FF6B00] p-6 rounded-lg">
                  <div className="text-3xl font-['Rajdhani'] font-bold text-black">₹50</div>
                  <div className="text-sm text-black/70">Starting Entry</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B00]/20 to-[#FFD700]/20" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-['Rajdhani'] font-bold text-white mb-6">
              Ready to Become a Legend?
            </h2>
            <p className="text-xl text-[#A1A1AA] mb-8 max-w-2xl mx-auto">
              Register now and join thousands of players competing for glory and real prizes
            </p>
            <Link
              to="/register"
              className="btn-primary px-12 py-4 text-lg inline-flex items-center gap-2"
              data-testid="cta-register"
            >
              <Flame className="w-5 h-5" />
              CREATE ACCOUNT
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}