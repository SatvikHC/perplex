import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Trophy, MapPin, Calendar, Wallet, Target, FileText,
  Youtube, ChevronLeft, Users, Info, Sword, Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { LoadingSpinner } from '../../components/UIComponents';

const ALL_MAPS = [
  { value: 'BERMUDA', label: 'Bermuda' },
  { value: 'PURGATORY', label: 'Purgatory' },
  { value: 'KALAHARI', label: 'Kalahari' },
  { value: 'ALPHINE', label: 'Alphine' },
  { value: 'NEXTERRA', label: 'Nexterra' },
  { value: 'SOLARA', label: 'Solara' },
];

const LONE_WOLF_MAPS = [
  { value: 'IRON_CAGE', label: 'Iron Cage' },
];

const TOURNAMENT_TYPES = [
  {
    id: 'SINGLE_BR',
    label: 'Single — Battle Royale',
    icon: '🏆',
    mode: 'BR',
    desc: 'Squad 4v4 • Any map • Up to 12 teams • 6 matches',
    maxTeams: 12,
    playersPerTeam: 4,
    maps: ALL_MAPS,
    multiMap: true,
    slotsOptions: [4, 6, 8, 10, 12],
  },
  {
    id: 'SINGLE_CS_4v4',
    label: 'Single — Clash Squad 4v4',
    icon: '⚔️',
    mode: 'CS_4v4',
    desc: '4v4 • 2 teams per match • 6 maps • Custom matches',
    maxTeams: 8,
    playersPerTeam: 4,
    maps: ALL_MAPS,
    multiMap: true,
    slotsOptions: [4, 6, 8],
  },
  {
    id: 'SINGLE_CS_2v2',
    label: 'Single — Clash Squad 2v2',
    icon: '🤝',
    mode: 'CS_2v2',
    desc: '2v2 • 2 teams • Max 2 slots (Team A vs Team B)',
    maxTeams: 2,
    playersPerTeam: 2,
    maps: ALL_MAPS,
    multiMap: true,
    fixedSlots: 2,
    slotsOptions: [2, 4, 8],
  },
  {
    id: 'SINGLE_CS_1v1',
    label: 'Single — Clash Squad 1v1',
    icon: '🎯',
    mode: 'CS_1v1',
    desc: '1v1 solo • Max 2 slots • Any map',
    maxTeams: 2,
    playersPerTeam: 1,
    maps: ALL_MAPS,
    multiMap: true,
    fixedSlots: 2,
    slotsOptions: [2, 4, 8, 16],
  },
  {
    id: 'SINGLE_LW_1v1',
    label: 'Single — Lone Wolf 1v1',
    icon: '🐺',
    mode: 'LW_1v1',
    desc: 'Solo 1v1 • Iron Cage only • Max 2 players',
    maxTeams: 2,
    playersPerTeam: 1,
    maps: LONE_WOLF_MAPS,
    multiMap: false,
    fixedSlots: 2,
    slotsOptions: [2, 4, 8, 16, 32, 48],
  },
  {
    id: 'SINGLE_LW_2v2',
    label: 'Single — Lone Wolf 2v2',
    icon: '🦅',
    mode: 'LW_2v2',
    desc: 'Duo 2v2 • Iron Cage only • Max 4 players (2 teams)',
    maxTeams: 2,
    playersPerTeam: 2,
    maps: LONE_WOLF_MAPS,
    multiMap: false,
    fixedSlots: 4,
    slotsOptions: [2, 4, 8, 16],
  },
  {
    id: 'LARGE_BR',
    label: 'Large Tournament (13-48 teams)',
    icon: '🌟',
    mode: 'BR',
    desc: 'Special BR • 13-48 teams • Qualifiers auto-generated',
    maxTeams: 48,
    playersPerTeam: 4,
    maps: ALL_MAPS,
    multiMap: true,
    isLarge: true,
    slotsOptions: [13, 24, 36, 48],
  },
];

const ENTRY_FEES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 100];
const MAP_BG = {BERMUDA:'from-green-900',PURGATORY:'from-purple-900',KALAHARI:'from-yellow-900',ALPHINE:'from-blue-900',NEXTERRA:'from-cyan-900',SOLARA:'from-red-900',IRON_CAGE:'from-gray-900'};

export default function AdminTournamentCreate() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [selectedType, setSelectedType] = useState(null);
  const [step, setStep] = useState(1); // 1=type, 2=details

  const [form, setForm] = useState({
    name: '',
    map: 'BERMUDA',
    scheduledAt: '',
    entryFee: 50,
    maxTeams: 12,
    prize1: 500, prize2: 300, prize3: 200, prize4: 0, prize5: 0, prize6: 0,
    perKillPrize: 5,
    rules: 'Standard Free Fire rules apply. No hacking, teaming, or glitch abuse.',
    youtubeUrl: '',
    description: '',
  });

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://cheerful-wilma-hcmedia-liva-cf966d17.koyeb.app';

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${API_URL}/api/admin/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.detail || 'Failed to create tournament');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success('Tournament created!');
      navigate(`/admin/tournaments/${data.id}`);
    },
    onError: err => toast.error(err.message),
  });

  const handleSelectType = (type) => {
    setSelectedType(type);
    setForm(f => ({
      ...f,
      map: type.maps[0]?.value || 'BERMUDA',
      maxTeams: type.fixedSlots || type.slotsOptions[type.slotsOptions.length - 1],
      rules: getDefaultRules(type),
    }));
    setStep(2);
  };

  const getDefaultRules = (type) => {
    if (type.mode === 'CS_1v1' || type.mode === 'CS_2v2' || type.mode === 'CS_4v4') {
      return 'Clash Squad rules: No camping, no teaming. Best of 6 maps. Each map is a new game. Fair play is mandatory. Cheaters will be banned permanently.';
    }
    if (type.mode === 'LW_1v1' || type.mode === 'LW_2v2') {
      return 'Lone Wolf rules: Iron Cage map only. No teaming. Solo/Duo survival rules apply. Last surviving player/team wins the match.';
    }
    return 'Standard Free Fire Battle Royale rules apply. No hacking, teaming, or glitch abuse. All 6 maps will be played. Overall standing decides the winner.';
  };

  const handleSubmit = () => {
    if (!form.name || !form.scheduledAt) {
      toast.error('Fill in tournament name and date');
      return;
    }

    const prizePool = {};
    if (parseFloat(form.prize1) > 0) prizePool['1'] = parseFloat(form.prize1);
    if (parseFloat(form.prize2) > 0) prizePool['2'] = parseFloat(form.prize2);
    if (parseFloat(form.prize3) > 0) prizePool['3'] = parseFloat(form.prize3);
    if (parseFloat(form.prize4) > 0) prizePool['4'] = parseFloat(form.prize4);
    if (parseFloat(form.prize5) > 0) prizePool['5'] = parseFloat(form.prize5);
    if (parseFloat(form.prize6) > 0) prizePool['6'] = parseFloat(form.prize6);

    const payload = {
      name: form.name,
      map: form.map,
      mode: selectedType.mode,
      tournamentTypeId: selectedType.id,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      entryFee: parseFloat(form.entryFee),
      maxTeams: parseInt(form.maxTeams),
      playersPerTeam: selectedType.playersPerTeam,
      prizePool,
      perKillPrize: parseFloat(form.perKillPrize) || 0,
      rules: form.rules,
      youtubeUrl: form.youtubeUrl || null,
      description: form.description || null,
      isLargeTournament: selectedType.isLarge || false,
    };

    createMutation.mutate(payload);
  };

  const totalPrize = [form.prize1, form.prize2, form.prize3, form.prize4, form.prize5, form.prize6]
    .reduce((s, v) => s + (parseFloat(v) || 0), 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => step === 2 ? setStep(1) : navigate(-1)} className="btn-ghost p-2 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-['Rajdhani'] font-bold text-white mb-1">Create Tournament</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className={step >= 1 ? 'text-[#FF6B00]' : 'text-[#52525B]'}>① Select Type</span>
            <span className="text-[#333]">→</span>
            <span className={step >= 2 ? 'text-[#FF6B00]' : 'text-[#52525B]'}>② Set Details</span>
          </div>
        </div>
      </div>

      {/* Step 1: Type Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-[#A1A1AA]">Choose the tournament type — each has different rules and player counts</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOURNAMENT_TYPES.map((type) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleSelectType(type)}
                className="glass-card rounded-xl p-5 text-left hover:border-[#FF6B00]/60 border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{type.icon}</span>
                  <div>
                    <h3 className="text-white font-['Rajdhani'] font-bold text-lg group-hover:text-[#FF6B00] transition-colors">
                      {type.label}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-white/10 text-[#A1A1AA] px-2 py-0.5 rounded">
                        {type.playersPerTeam === 1 ? 'Solo' : type.playersPerTeam === 2 ? 'Duo' : 'Squad'} × {type.playersPerTeam}
                      </span>
                      <span className="text-xs bg-[#FF6B00]/10 text-[#FF6B00] px-2 py-0.5 rounded">
                        Max {type.isLarge ? '48' : type.fixedSlots || Math.max(...type.slotsOptions)} teams
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[#52525B] text-sm">{type.desc}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#A1A1AA]">
                  <MapPin className="w-3 h-3" />
                  {type.maps.map(m => m.label).join(', ')}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && selectedType && (
        <div className="space-y-6">
          {/* Selected type badge */}
          <div className="flex items-center gap-3 p-4 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-lg">
            <span className="text-2xl">{selectedType.icon}</span>
            <div>
              <p className="text-[#FF6B00] font-semibold">{selectedType.label}</p>
              <p className="text-[#A1A1AA] text-xs">{selectedType.desc}</p>
            </div>
            <button onClick={() => setStep(1)} className="ml-auto text-[#52525B] hover:text-white text-xs underline">Change type</button>
          </div>

          {/* Basic Info */}
          <div className="glass-card rounded-xl p-6 space-y-5">
            <h2 className="text-xl font-['Rajdhani'] font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FF6B00]" />Basic Info
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm text-[#A1A1AA] mb-2">Tournament Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className="input-dark w-full px-4 py-3 rounded" placeholder={`e.g., OSG ${selectedType.icon} Weekly #1`} />
              </div>

              <div>
                <label className="block text-sm text-[#A1A1AA] mb-2">Date & Time *</label>
                <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({...f, scheduledAt: e.target.value}))}
                  className="input-dark w-full px-4 py-3 rounded" />
              </div>

              {/* Map selector */}
              <div>
                <label className="block text-sm text-[#A1A1AA] mb-2">
                  Map {selectedType.mode.startsWith('LW') ? '(Fixed: Iron Cage)' : ''}
                </label>
                {selectedType.mode.startsWith('LW') ? (
                  <div className="input-dark px-4 py-3 rounded opacity-60 text-white">Iron Cage</div>
                ) : (
                  <select value={form.map} onChange={e => setForm(f => ({...f, map: e.target.value}))}
                    className="input-dark w-full px-4 py-3 rounded">
                    {selectedType.maps.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                )}
              </div>

              {/* Slots */}
              <div>
                <label className="block text-sm text-[#A1A1AA] mb-2">
                  Max Teams/Slots
                  {selectedType.fixedSlots && <span className="text-[#52525B] ml-1">(Fixed: {selectedType.fixedSlots})</span>}
                </label>
                {selectedType.fixedSlots ? (
                  <div className="input-dark px-4 py-3 rounded opacity-60 text-white">{selectedType.fixedSlots} slots</div>
                ) : (
                  <select value={form.maxTeams} onChange={e => setForm(f => ({...f, maxTeams: parseInt(e.target.value)}))}
                    className="input-dark w-full px-4 py-3 rounded">
                    {selectedType.slotsOptions.map(n => (
                      <option key={n} value={n}>
                        {n} teams ({n * selectedType.playersPerTeam} players total)
                        {n > 12 && selectedType.isLarge ? ' — Qualifiers auto-generated' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Entry fee */}
              <div>
                <label className="block text-sm text-[#A1A1AA] mb-2">
                  Entry Fee
                  <span className="text-[#52525B] ml-1">
                    (Each {selectedType.playersPerTeam === 1 ? 'player' : `player pays ₹${Math.ceil((form.entryFee||0)/selectedType.playersPerTeam)}`})
                  </span>
                </label>
                <div className="flex gap-2">
                  <select value={form.entryFee} onChange={e => setForm(f => ({...f, entryFee: e.target.value}))}
                    className="input-dark flex-1 px-4 py-3 rounded">
                    {ENTRY_FEES.map(f => <option key={f} value={f}>{f === 0 ? 'Free' : `₹${f}`}</option>)}
                  </select>
                  <input type="number" value={form.entryFee} onChange={e => setForm(f => ({...f, entryFee: e.target.value}))}
                    className="input-dark w-24 px-4 py-3 rounded" min="0" placeholder="Custom" />
                </div>
                {selectedType.playersPerTeam > 1 && parseFloat(form.entryFee) > 0 && (
                  <p className="text-xs text-[#FF6B00] mt-1">
                    ₹{(parseFloat(form.entryFee)/selectedType.playersPerTeam).toFixed(2)} per player from each member's wallet
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#A1A1AA] mb-2">Per Kill Prize (₹)</label>
                <input type="number" value={form.perKillPrize} onChange={e => setForm(f => ({...f, perKillPrize: e.target.value}))}
                  className="input-dark w-full px-4 py-3 rounded" min="0" />
              </div>
            </div>
          </div>

          {/* Prize Pool */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-['Rajdhani'] font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#FFD700]" />Prize Pool
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { rank: '1', label: '🥇 1st Place', field: 'prize1' },
                { rank: '2', label: '🥈 2nd Place', field: 'prize2' },
                { rank: '3', label: '🥉 3rd Place', field: 'prize3' },
                { rank: '4', label: '4th Place', field: 'prize4' },
                { rank: '5', label: '5th Place', field: 'prize5' },
                { rank: '6', label: '6th Place', field: 'prize6' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs text-[#A1A1AA] mb-1">{label}</label>
                  <input type="number" value={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
                    className="input-dark w-full px-4 py-2 rounded" min="0" placeholder="0" />
                </div>
              ))}
            </div>
            <div className="p-3 bg-[#FFD700]/10 rounded border border-[#FFD700]/20">
              <p className="text-[#FFD700] text-sm font-semibold">
                Total Prize Pool: ₹{totalPrize.toLocaleString()}
                {parseFloat(form.perKillPrize) > 0 && ` + ₹${form.perKillPrize}/kill`}
              </p>
              {selectedType.playersPerTeam > 1 && totalPrize > 0 && (
                <p className="text-[#52525B] text-xs mt-1">
                  Each 1st place team member gets: ₹{((parseFloat(form.prize1)||0)/selectedType.playersPerTeam).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Rules */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-['Rajdhani'] font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF6B00]" />Rules & Details
            </h2>
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Tournament Rules</label>
              <textarea value={form.rules} onChange={e => setForm(f => ({...f, rules: e.target.value}))}
                rows={5} className="input-dark w-full px-4 py-3 rounded resize-none" />
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Description (optional)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                rows={2} className="input-dark w-full px-4 py-3 rounded resize-none" placeholder="Short description for players..." />
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">YouTube Stream URL (optional)</label>
              <input type="text" value={form.youtubeUrl} onChange={e => setForm(f => ({...f, youtubeUrl: e.target.value}))}
                className="input-dark w-full px-4 py-3 rounded" placeholder="https://youtube.com/watch?v=..." />
            </div>
          </div>

          {/* Summary & Submit */}
          <div className="glass-card rounded-xl p-5 border border-[#FF6B00]/20">
            <h3 className="text-white font-semibold mb-3">📋 Tournament Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {[
                ['Type', selectedType.label],
                ['Mode', selectedType.mode],
                ['Teams', `${form.maxTeams} teams`],
                ['Players', `${selectedType.playersPerTeam} per team`],
                ['Entry Fee', form.entryFee > 0 ? `₹${form.entryFee}` : 'Free'],
                ['Per Player', form.entryFee > 0 ? `₹${(parseFloat(form.entryFee)/selectedType.playersPerTeam).toFixed(2)}` : 'Free'],
                ['Total Prize', `₹${totalPrize}`],
                ['Map', selectedType.mode.startsWith('LW') ? 'Iron Cage' : form.map],
              ].map(([k, v]) => (
                <div key={k} className="bg-white/5 rounded p-2">
                  <div className="text-[#52525B] text-xs">{k}</div>
                  <div className="text-white font-medium">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="btn-secondary px-8 py-4">← Back</button>
            <button onClick={handleSubmit} disabled={!form.name || !form.scheduledAt || createMutation.isPending}
              className="btn-primary px-8 py-4 flex-1 flex items-center justify-center gap-2">
              {createMutation.isPending ? <LoadingSpinner size="sm" /> : <><Trophy className="w-5 h-5" />Create Tournament</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}