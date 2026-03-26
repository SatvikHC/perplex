import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  MapPin, Clock, Trophy, Users, ChevronLeft, ExternalLink,
  Key, Lock, Copy, CheckCircle, AlertCircle, Gamepad2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Countdown, Skeleton, PageTransition, Badge, Modal, LoadingSpinner } from '../components/UIComponents';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const tabs = ['Overview', 'Teams', 'Points Table', 'Live Stream'];

const mapImages = {
  BERMUDA: 'https://images.unsplash.com/photo-1660509426337-e7075d7686ff?w=1200&h=400&fit=crop',
  PURGATORY: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=1200&h=400&fit=crop',
  KALAHARI: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&h=400&fit=crop',
  ALPHINE: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=400&fit=crop',
  NEXTERRA: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop',
  SOLARA: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&h=400&fit=crop',
};

export default function TournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [registering, setRegistering] = useState(false);

  const { data: tournament, isLoading, refetch } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => api.getTournament(id),
  });

  const { data: teams } = useQuery({
    queryKey: ['tournamentTeams', id],
    queryFn: () => api.getTournamentTeams(id),
    enabled: !!id,
  });

  const { data: standings, refetch: refetchStandings } = useQuery({
    queryKey: ['tournamentStandings', id],
    queryFn: () => api.getTournamentStandings(id),
    enabled: !!id,
  });

  const { data: eligibility } = useQuery({
    queryKey: ['eligibility', id],
    queryFn: () => api.checkEligibility(id, token),
    enabled: !!user && !!token && tournament?.status === 'REGISTERING',
  });

  const { data: roomDetails } = useQuery({
    queryKey: ['roomDetails', id],
    queryFn: () => api.getTournamentRoom(id, token),
    enabled: !!user && !!token,
    retry: false,
  });

  // SSE for live updates
  useEffect(() => {
    if (!id || !['LIVE', 'REGISTERING'].includes(tournament?.status)) return;

    const API_URL = process.env.REACT_APP_BACKEND_URL;
    const eventSource = new EventSource(`${API_URL}/api/sse/tournament/${id}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'STANDINGS_UPDATE') {
        refetchStandings();
      } else if (data.type === 'ROOM_RELEASED') {
        toast.success('Room details released!');
        refetch();
      }
    };

    return () => eventSource.close();
  }, [id, tournament?.status, refetch, refetchStandings]);

  const handleRegister = async (paymentMethod) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      const result = await api.createRegistration(id, paymentMethod, token);
      toast.success(`Registration successful! Slot #${result.slotNumber}`);
      setShowRegisterModal(false);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRegistering(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-64 rounded-lg mb-8" />
            <Skeleton className="h-12 w-1/2 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-48" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#FF1A1A] mx-auto mb-4" />
          <h2 className="text-2xl font-['Rajdhani'] font-bold text-white mb-2">
            Tournament Not Found
          </h2>
          <Link to="/tournaments" className="btn-primary px-6 py-3 mt-4 inline-block">
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const totalPrize = Object.values(tournament.prizePool || {}).reduce((a, b) => a + b, 0);
  const isRegistered = teams?.some(t => t.teamId === user?.team?.id);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />

        {/* Hero Banner */}
        <div className="relative h-64 md:h-80">
          <img
            src={mapImages[tournament.map] || mapImages.BERMUDA}
            alt={tournament.map}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/60 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-24 left-4 md:left-8">
            <Badge variant={tournament.status === 'LIVE' ? 'danger' : tournament.status === 'REGISTERING' ? 'secondary' : 'default'}>
              {tournament.status === 'LIVE' && <span className="live-dot mr-2" />}
              {tournament.status}
            </Badge>
          </div>

          {/* Back Button */}
          <Link
            to="/tournaments"
            className="absolute top-24 right-4 md:right-8 btn-ghost p-2 rounded-full bg-black/30 backdrop-blur"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </div>

        <main className="relative -mt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title Section */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-5xl font-['Rajdhani'] font-bold text-white mb-4">
                {tournament.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-[#A1A1AA]">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF6B00]" />
                  {tournament.map}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF6B00]" />
                  {format(new Date(tournament.scheduledAt), 'MMM d, yyyy • h:mm a')}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF6B00]" />
                  {tournament.filledSlots}/{tournament.maxTeams} Teams
                </span>
              </div>
            </div>

            {/* Countdown for upcoming */}
            {['UPCOMING', 'REGISTERING'].includes(tournament.status) && (
              <div className="glass-card rounded-lg p-6 mb-8">
                <p className="text-[#A1A1AA] text-sm uppercase tracking-wider mb-4">Match Starts In</p>
                <Countdown targetDate={tournament.scheduledAt} />
              </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {tabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 font-['Rajdhani'] font-semibold whitespace-nowrap transition-all ${
                        activeTab === tab
                          ? 'bg-[#FF6B00] text-black'
                          : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
                      }`}
                      data-testid={`tab-${tab.toLowerCase().replace(' ', '-')}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {activeTab === 'Overview' && (
                      <div className="space-y-6">
                        {/* Prize Pool */}
                        <div className="glass-card rounded-lg p-6">
                          <h3 className="text-xl font-['Rajdhani'] font-bold text-white mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-[#FFD700]" />
                            Prize Pool
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                            {Object.entries(tournament.prizePool || {}).map(([rank, prize]) => (
                              <div key={rank} className="text-center p-4 bg-white/5 rounded">
                                <div className="text-2xl font-['Rajdhani'] font-bold text-white">₹{prize}</div>
                                <div className="text-sm text-[#A1A1AA]">#{rank} Place</div>
                              </div>
                            ))}
                          </div>
                          {tournament.perKillPrize > 0 && (
                            <div className="mt-4 p-4 bg-[#FF6B00]/10 rounded">
                              <span className="text-[#FF6B00] font-semibold">
                                + ₹{tournament.perKillPrize} per kill
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Rules */}
                        <div className="glass-card rounded-lg p-6">
                          <h3 className="text-xl font-['Rajdhani'] font-bold text-white mb-4">
                            Tournament Rules
                          </h3>
                          <div className="prose prose-invert max-w-none text-[#A1A1AA]">
                            <p>{tournament.rules || 'Standard Free Fire Battle Royale rules apply. No hacking, teaming, or glitch abuse.'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'Teams' && (
                      <div className="glass-card rounded-lg p-6">
                        <h3 className="text-xl font-['Rajdhani'] font-bold text-white mb-6">
                          Registered Teams ({teams?.length || 0}/{tournament.maxTeams})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {Array.from({ length: tournament.maxTeams }).map((_, i) => {
                            const team = teams?.find(t => t.slotNumber === i + 1);
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={`p-4 rounded text-center ${
                                  team ? 'bg-[#FF6B00]/10 border border-[#FF6B00]/30' : 'bg-white/5 border border-white/10'
                                }`}
                              >
                                <div className="text-lg font-['Rajdhani'] font-bold text-[#FF6B00] mb-1">
                                  #{i + 1}
                                </div>
                                <div className={team ? 'text-white' : 'text-[#52525B]'}>
                                  {team?.teamName || 'OPEN'}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeTab === 'Points Table' && (
                      <div className="glass-card rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="data-table min-w-full">
                            <thead>
                              <tr className="bg-white/5">
                                <th>Rank</th>
                                <th>Team</th>
                                <th className="text-center">M1</th>
                                <th className="text-center">M2</th>
                                <th className="text-center">M3</th>
                                <th className="text-center">M4</th>
                                <th className="text-center">M5</th>
                                <th className="text-center">M6</th>
                                <th className="text-center">Kills</th>
                                <th className="text-center text-[#FFD700]">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {standings?.length > 0 ? standings.map((team, index) => (
                                <motion.tr
                                  key={team.teamId}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  layout
                                  className={index < 3 ? 'bg-[#FFD700]/5' : ''}
                                >
                                  <td>
                                    <span className={`font-['Rajdhani'] font-bold ${
                                      index === 0 ? 'text-[#FFD700]' :
                                      index === 1 ? 'text-gray-300' :
                                      index === 2 ? 'text-orange-400' : 'text-white'
                                    }`}>
                                      #{team.rank}
                                    </span>
                                  </td>
                                  <td className="font-semibold">{team.teamName}</td>
                                  {[1, 2, 3, 4, 5, 6].map(m => (
                                    <td key={m} className="text-center">
                                      {team.matches?.[`M${m}`]?.totalPoints ?? '-'}
                                    </td>
                                  ))}
                                  <td className="text-center text-[#FF6B00] font-semibold">
                                    {team.totalKills}
                                  </td>
                                  <td className="text-center text-[#FFD700] font-['Rajdhani'] font-bold text-lg">
                                    {team.totalPoints}
                                  </td>
                                </motion.tr>
                              )) : (
                                <tr>
                                  <td colSpan={10} className="text-center py-8 text-[#A1A1AA]">
                                    No match results yet
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {activeTab === 'Live Stream' && (
                      <div className="glass-card rounded-lg p-6">
                        {tournament.youtubeUrl ? (
                          <div className="aspect-video">
                            <iframe
                              src={tournament.youtubeUrl.replace('watch?v=', 'embed/')}
                              className="w-full h-full rounded"
                              allowFullScreen
                              title="Live Stream"
                            />
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <ExternalLink className="w-12 h-12 text-[#52525B] mx-auto mb-4" />
                            <p className="text-[#A1A1AA]">Live stream will be available when the match starts</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Quick Info */}
                <div className="glass-card rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-[#A1A1AA]">Entry Fee</span>
                      <span className="text-white font-bold text-lg">₹{tournament.entryFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A1A1AA]">Total Prize</span>
                      <span className="text-[#FFD700] font-bold text-lg">₹{totalPrize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A1A1AA]">Slots</span>
                      <span className="text-white">{tournament.filledSlots}/{tournament.maxTeams}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A1A1AA]">Per Kill</span>
                      <span className="text-[#FF6B00]">₹{tournament.perKillPrize}</span>
                    </div>
                  </div>
                </div>

                {/* Room Details (if registered and released) */}
                {roomDetails?.released && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-lg p-6 border-2 border-[#FF6B00] glow-orange"
                  >
                    <h3 className="text-lg font-['Rajdhani'] font-bold text-white mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5 text-[#FF6B00]" />
                      Room Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-[#A1A1AA]">Room ID</label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 bg-black/50 px-4 py-2 rounded text-[#FFD700] font-mono">
                            {roomDetails.roomId}
                          </code>
                          <button
                            onClick={() => copyToClipboard(roomDetails.roomId)}
                            className="btn-ghost p-2"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-[#A1A1AA]">Password</label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 bg-black/50 px-4 py-2 rounded text-[#FFD700] font-mono">
                            {roomDetails.roomPassword}
                          </code>
                          <button
                            onClick={() => copyToClipboard(roomDetails.roomPassword)}
                            className="btn-ghost p-2"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#FF1A1A] mt-4">DO NOT SHARE WITH ANYONE</p>
                  </motion.div>
                )}

                {/* Registration CTA */}
                {tournament.status === 'REGISTERING' && (
                  <div className="glass-card rounded-lg p-6">
                    {isRegistered ? (
                      <div className="text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-green-500 font-semibold">You're Registered!</p>
                        <p className="text-sm text-[#A1A1AA] mt-2">
                          Room details will be revealed 15 minutes before match
                        </p>
                      </div>
                    ) : (
                      <>
                        {eligibility?.eligible ? (
                          <button
                            onClick={() => setShowRegisterModal(true)}
                            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                            data-testid="register-btn"
                          >
                            <Gamepad2 className="w-5 h-5" />
                            Register Now
                          </button>
                        ) : (
                          <div>
                            <button
                              disabled
                              className="btn-primary w-full py-4 opacity-50 cursor-not-allowed"
                            >
                              Cannot Register
                            </button>
                            {eligibility?.issues?.map((issue, i) => (
                              <p key={i} className="text-sm text-[#FF1A1A] mt-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {issue.message}
                              </p>
                            ))}
                            {!user && (
                              <Link to="/login" className="btn-secondary w-full py-3 mt-4 block text-center">
                                Login to Register
                              </Link>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />

        {/* Registration Modal */}
        <Modal
          isOpen={showRegisterModal}
          onClose={() => { setShowRegisterModal(false); setRegistrationStep(1); }}
          title="Tournament Registration"
        >
          {registrationStep === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Your Team</h4>
                {eligibility?.team?.memberDetails?.map((member, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-white">{member.ign}</span>
                    <span className="text-[#A1A1AA] text-sm">{member.ffUid}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setRegistrationStep(2)}
                className="btn-primary w-full py-3"
              >
                Confirm Team & Proceed
              </button>
            </div>
          )}

          {registrationStep === 2 && (
            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded max-h-48 overflow-y-auto text-sm text-[#A1A1AA]">
                <p className="font-semibold text-white mb-2">Tournament Rules</p>
                <p>{tournament.rules || 'Standard Free Fire Battle Royale rules apply.'}</p>
              </div>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" id="rules-accept" />
                <span className="text-sm text-[#A1A1AA]">
                  I have read and accept all tournament rules. I confirm all 4 players are legitimate accounts.
                </span>
              </label>
              <button
                onClick={() => setRegistrationStep(3)}
                className="btn-primary w-full py-3"
              >
                Accept & Continue to Payment
              </button>
            </div>
          )}

          {registrationStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Entry Fee</span>
                  <span className="text-white">₹{tournament.entryFee}</span>
                </div>
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Platform Fee</span>
                  <span className="text-white">₹0</span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-[#FFD700]">₹{tournament.entryFee}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-[#A1A1AA]">Select Payment Method</p>
                
                {user?.walletBalance >= tournament.entryFee && (
                  <button
                    onClick={() => handleRegister('wallet')}
                    disabled={registering}
                    className="w-full p-4 bg-green-500/10 border border-green-500/30 rounded flex items-center justify-between hover:bg-green-500/20 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-green-500" />
                      <span>Wallet Balance</span>
                    </span>
                    <span className="text-green-500 font-semibold">₹{user.walletBalance}</span>
                  </button>
                )}

                <button
                  onClick={() => handleRegister('razorpay')}
                  disabled={registering}
                  className="w-full p-4 bg-blue-500/10 border border-blue-500/30 rounded flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-colors"
                >
                  {registering ? <LoadingSpinner size="sm" /> : 'Pay with Razorpay DONT CLICK HERE'}
                </button>

                <button
                  onClick={() => handleRegister('cashfree')}
                  disabled={registering}
                  className="w-full p-4 bg-purple-500/10 border border-purple-500/30 rounded flex items-center justify-center gap-2 hover:bg-purple-500/20 transition-colors"
                >
                  {registering ? <LoadingSpinner size="sm" /> : 'Pay with Cashfree DONT CLICK HERE'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PageTransition>
  );
}
