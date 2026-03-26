import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Trophy, Star, Plus, ChevronRight, Crown, Flag,
  CheckCircle, Users, ArrowRight, Loader, BarChart3,
  FlaskConical, Trash2, RefreshCw, AlertTriangle, Gift
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Modal, LoadingSpinner, Badge, Skeleton } from '../../components/UIComponents';

const MAPS = ['BERMUDA','PURGATORY','KALAHARI','ALPHINE','NEXTERRA','SOLARA'];
const MAP_LABELS = {BERMUDA:'Bermuda',PURGATORY:'Purgatory',KALAHARI:'Kalahari',ALPHINE:'Alphine',NEXTERRA:'Nexterra',SOLARA:'Solara'};

// ─── StageFlow component shows the tournament bracket ───────────────────────
function StageFlow({ structure }) {
  if (!structure) return null;
  const { numQualifiers, teamsPerQualifier, advancePerQualifier, needsSemis, finalsTeams } = structure;
  return (
    <div className="flex items-center gap-2 flex-wrap text-xs">
      <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded px-3 py-1.5 text-center">
        <div className="text-[#FF6B00] font-bold">{numQualifiers}× Qualifiers</div>
        <div className="text-[#52525B]">{teamsPerQualifier} teams each</div>
      </div>
      <ArrowRight className="w-4 h-4 text-[#52525B]" />
      <div className="bg-blue-500/10 border border-blue-500/30 rounded px-3 py-1.5 text-center">
        <div className="text-blue-400 font-bold">Top {advancePerQualifier}/qualifier</div>
        <div className="text-[#52525B]">{numQualifiers * advancePerQualifier} teams advance</div>
      </div>
      {needsSemis && (
        <>
          <ArrowRight className="w-4 h-4 text-[#52525B]" />
          <div className="bg-purple-500/10 border border-purple-500/30 rounded px-3 py-1.5 text-center">
            <div className="text-purple-400 font-bold">Semi-Finals</div>
            <div className="text-[#52525B]">{numQualifiers * advancePerQualifier} teams</div>
          </div>
        </>
      )}
      <ArrowRight className="w-4 h-4 text-[#52525B]" />
      <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded px-3 py-1.5 text-center">
        <div className="text-[#FFD700] font-bold">🏆 Finals</div>
        <div className="text-[#52525B]">{finalsTeams} teams</div>
      </div>
    </div>
  );
}

// ─── StandingsSelector: shows standings table with checkboxes to select teams ─
function StandingsSelector({ specialId, stage, maxSelect, onSelect, token }) {
  const [selected, setSelected] = useState({});

  const { data: standings, isLoading } = useQuery({
    queryKey: ['specialStandings', specialId, stage],
    queryFn: () => api.getSpecialStandings(specialId, stage, token),
    enabled: !!specialId && !!token,
  });

  const toggleTeam = (team) => {
    setSelected(prev => {
      if (prev[team.teamId]) {
        const n = { ...prev };
        delete n[team.teamId];
        return n;
      }
      if (Object.keys(prev).length >= maxSelect) {
        toast.error(`Can only select ${maxSelect} teams`);
        return prev;
      }
      return { ...prev, [team.teamId]: team };
    });
  };

  const handleConfirm = () => {
    const teams = Object.values(selected).map(t => ({
      teamId: t.teamId,
      teamName: t.teamName,
      fromTournamentId: t.tournamentId,
      totalPoints: t.totalPoints,
      totalKills: t.totalKills,
    }));
    onSelect(teams);
  };

  if (isLoading) return <div className="text-center py-8"><LoadingSpinner /></div>;

  // Group by tournament
  const byTournament = {};
  (standings || []).forEach(t => {
    const key = t.fromTournament || 'Unknown';
    if (!byTournament[key]) byTournament[key] = [];
    byTournament[key].push(t);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[#A1A1AA] text-sm">Select <strong className="text-[#FF6B00]">{maxSelect}</strong> teams to advance ({Object.keys(selected).length}/{maxSelect} selected)</p>
        <button onClick={handleConfirm} disabled={Object.keys(selected).length === 0}
          className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-40">
          <CheckCircle className="w-4 h-4" />Confirm Selection ({Object.keys(selected).length})
        </button>
      </div>

      {Object.entries(byTournament).map(([tourneyName, teams]) => (
        <div key={tourneyName} className="glass-card rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-white/5 border-b border-white/10">
            <span className="text-white font-semibold text-sm flex items-center gap-2">
              <Flag className="w-4 h-4 text-[#FF6B00]" />{tourneyName}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-[#A1A1AA] uppercase">
                  <th className="px-3 py-2 text-center w-10">✓</th>
                  <th className="px-3 py-2 text-left">Rank</th>
                  <th className="px-3 py-2 text-left">Team</th>
                  <th className="px-3 py-2 text-center">Kills</th>
                  <th className="px-3 py-2 text-center text-[#FFD700]">Points</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, idx) => {
                  const isSelected = !!selected[team.teamId];
                  return (
                    <tr key={team.teamId}
                      onClick={() => toggleTeam(team)}
                      className={`border-b border-white/5 cursor-pointer transition-all ${isSelected ? 'bg-[#FF6B00]/15 border-[#FF6B00]/30' : 'hover:bg-white/5'}`}>
                      <td className="px-3 py-3 text-center">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto ${isSelected ? 'bg-[#FF6B00] border-[#FF6B00]' : 'border-white/30'}`}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-black" />}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-bold text-[#FFD700]">#{team.rank}</td>
                      <td className="px-3 py-3 text-white font-medium">{team.teamName}</td>
                      <td className="px-3 py-3 text-center text-[#FF6B00]">{team.totalKills}</td>
                      <td className="px-3 py-3 text-center font-['Rajdhani'] font-bold text-[#FFD700] text-lg">{team.totalPoints}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminSpecialTournaments() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSpecial, setSelectedSpecial] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQualifierModal, setShowQualifierModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageType, setStageType] = useState('SEMI');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectingFrom, setSelectingFrom] = useState('qualifiers');
  const [seeding, setSeeding] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '', totalTeams: 24, teamsPerQualifier: 12,
    advancePerQualifier: 6, entryFee: 50,
    prize1: 5000, prize2: 2500, prize3: 1000, perKillPrize: 5,
    rules: 'Standard Free Fire Battle Royale rules apply.',
    scheduledAt: '',
  });

  const [qualForm, setQualForm] = useState({
    name: '', scheduledAt: '',
    selectedMaps: ['BERMUDA','PURGATORY','KALAHARI','ALPHINE','NEXTERRA','SOLARA'],
  });

  const [stageForm, setStageForm] = useState({
    name: '', scheduledAt: '',
    selectedMaps: ['BERMUDA','PURGATORY','KALAHARI','ALPHINE','NEXTERRA','SOLARA'],
    prize1: 5000, prize2: 2500, prize3: 1000,
  });

  const { data: specials, isLoading } = useQuery({
    queryKey: ['specialTournaments'],
    queryFn: () => api.getSpecialTournaments(token),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (d) => api.createSpecialTournament(d, token),
    onSuccess: (data) => {
      toast.success(`Special tournament created! ${data.structure.numQualifiers} qualifiers needed.`);
      queryClient.invalidateQueries(['specialTournaments']);
      setShowCreateModal(false);
    },
    onError: err => toast.error(err.message),
  });

  const qualMutation = useMutation({
    mutationFn: ({ specialId, data }) => api.createQualifierForSpecial(specialId, data, token),
    onSuccess: (data) => {
      toast.success(`Qualifier created! Tournament ID: ${data.tournamentId}`);
      queryClient.invalidateQueries(['specialTournaments']);
      setShowQualifierModal(false);
      navigate(`/admin/tournaments/${data.tournamentId}`);
    },
    onError: err => toast.error(err.message),
  });

  const stageMutation = useMutation({
    mutationFn: ({ specialId, data }) => api.createNextStage(specialId, data, token),
    onSuccess: (data) => {
      toast.success(`${stageType} created with ${data.teamsImported} teams! Teams notified.`);
      queryClient.invalidateQueries(['specialTournaments']);
      setShowStageModal(false);
      navigate(`/admin/tournaments/${data.tournamentId}`);
    },
    onError: err => toast.error(err.message),
  });

  const handleTeamsSelected = (teams) => {
    setSelectedTeams(teams);
    toast.success(`${teams.length} teams selected! Now set the ${stageType} details.`);
  };

  const handleCreateStage = () => {
    if (selectedTeams.length === 0) { toast.error('Select teams first'); return; }
    stageMutation.mutate({
      specialId: selectedSpecial.id,
      data: {
        stage: stageType,
        selectedTeams,
        name: stageForm.name || `${selectedSpecial.name} — ${stageType}`,
        scheduledAt: stageForm.scheduledAt,
        maps: stageForm.selectedMaps,
        prizePool: stageType === 'FINALS' ? {
          '1': parseFloat(stageForm.prize1) || 0,
          '2': parseFloat(stageForm.prize2) || 0,
          '3': parseFloat(stageForm.prize3) || 0,
        } : {},
      }
    });
  };

  const handleSeedTest = async () => {
    setSeeding(true);
    try {
      const r = await api.seedSpecialTest();
      toast.success(r.message);
      queryClient.invalidateQueries(['specialTournaments']);
    } catch(e) { toast.error(e.message); }
    finally { setSeeding(false); }
  };

  const totalTeams = parseInt(form.totalTeams) || 24;
  const teamsPerQ = parseInt(form.teamsPerQualifier) || 12;
  const advancePerQ = parseInt(form.advancePerQualifier) || 6;
  const numQ = Math.ceil(totalTeams / teamsPerQ);
  const totalInSemis = numQ * advancePerQ;
  const needsSemis = totalInSemis > 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-['Rajdhani'] font-bold text-white mb-1">Special Tournaments</h1>
          <p className="text-[#A1A1AA]">Large-scale tournaments (13-48 teams) with qualifiers, semis & finals</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSeedTest} disabled={seeding}
            className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded text-sm flex items-center gap-2 hover:bg-yellow-500/20">
            {seeding ? <Loader className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
            Test (24 teams)
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary px-6 py-3 flex items-center gap-2">
            <Plus className="w-5 h-5" />Create Special Tournament
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="glass-card rounded-xl p-5 border border-[#FFD700]/20">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-[#FFD700]" />How Special Tournaments Work (48-team example)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {[
            { step: '1', label: 'Create Special', desc: 'Set 48 teams, 12 per qualifier' },
            { step: '2', label: 'Create 4 Qualifiers', desc: '12 teams each, 6 maps BR' },
            { step: '3', label: 'Enter Scores', desc: 'All 6 maps results for each qualifier' },
            { step: '4', label: 'Select Top 6', desc: 'From each qualifier → advance to next stage' },
            { step: '5', label: 'Generate Finals', desc: 'Top 12 auto-imported, prizes distributed' },
          ].map(s => (
            <div key={s.step} className="bg-white/5 rounded p-3 border border-white/10">
              <div className="w-6 h-6 bg-[#FF6B00] rounded-full text-black font-bold text-xs flex items-center justify-center mb-2">{s.step}</div>
              <div className="text-white font-semibold mb-1">{s.label}</div>
              <div className="text-[#52525B]">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Tournament List */}
      {isLoading ? (
        <div className="space-y-4">{[1,2].map(i=><Skeleton key={i} className="h-40 rounded-xl"/>)}</div>
      ) : specials?.length > 0 ? (
        <div className="space-y-4">
          {specials.map((special, idx) => (
            <motion.div key={special.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}
              className="glass-card rounded-xl p-6 border border-white/10">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <Star className="w-5 h-5 text-[#FFD700]" />
                    <h3 className="text-xl font-['Rajdhani'] font-bold text-white">{special.name}</h3>
                    <Badge variant={special.status==='ACTIVE'?'danger':'default'}>{special.status}</Badge>
                  </div>
                  <StageFlow structure={special.structure} />
                  <div className="flex gap-4 text-sm text-[#A1A1AA] mt-3 flex-wrap">
                    <span>{special.totalTeams} total teams</span>
                    <span>Entry: ₹{special.entryFee}</span>
                    <span>Prize: ₹{Object.values(special.prizePool||{}).reduce((a,b)=>a+b,0)}</span>
                    {special.createdAt && <span>{format(new Date(special.createdAt), 'MMM d, yyyy')}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setSelectedSpecial(special); setShowDetailModal(true); }}
                    className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />Manage
                  </button>
                  {special.qualifierTournaments?.length < special.structure?.numQualifiers && (
                    <button onClick={() => { setSelectedSpecial(special); setShowQualifierModal(true); }}
                      className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 text-[#FF6B00] border-[#FF6B00]">
                      <Plus className="w-4 h-4" />Add Qualifier {(special.qualifierTournaments?.length||0)+1}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-[#FF6B00] font-['Rajdhani'] font-bold text-2xl">{special.qualifierTournaments?.length||0}/{special.structure?.numQualifiers}</div>
                  <div className="text-[#52525B] text-xs">Qualifiers Created</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-['Rajdhani'] font-bold text-2xl">{special.semiTournaments?.length||0}</div>
                  <div className="text-[#52525B] text-xs">Semi-Finals</div>
                </div>
                <div className="text-center">
                  <div className={`font-['Rajdhani'] font-bold text-2xl ${special.finalsTournamentId ? 'text-[#FFD700]' : 'text-[#333]'}`}>
                    {special.finalsTournamentId ? '✅' : '—'}
                  </div>
                  <div className="text-[#52525B] text-xs">Finals</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-['Rajdhani'] font-bold text-2xl">{special.qualifierTournaments?.map(q=>q.qualifierNumber)||'—'}</div>
                  <div className="text-[#52525B] text-xs">Q Numbers</div>
                </div>
              </div>

              {/* Qualifier links */}
              {special.qualifierTournaments?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {special.qualifierTournaments.map(q => (
                    <button key={q.id} onClick={() => navigate(`/admin/tournaments/${q.id}`)}
                      className="px-3 py-1.5 bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] rounded text-xs hover:bg-[#FF6B00]/20 flex items-center gap-1">
                      <Flag className="w-3 h-3" />{q.name} <ChevronRight className="w-3 h-3" />
                    </button>
                  ))}
                  {special.semiTournaments?.map(s => (
                    <button key={s.id} onClick={() => navigate(`/admin/tournaments/${s.id}`)}
                      className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded text-xs hover:bg-purple-500/20 flex items-center gap-1">
                      <Trophy className="w-3 h-3" />{s.name} <ChevronRight className="w-3 h-3" />
                    </button>
                  ))}
                  {special.finalsTournamentId && (
                    <button onClick={() => navigate(`/admin/tournaments/${special.finalsTournamentId}`)}
                      className="px-3 py-1.5 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] rounded text-xs hover:bg-[#FFD700]/20 flex items-center gap-1">
                      <Crown className="w-3 h-3" />Finals <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 glass-card rounded-xl">
          <Star className="w-16 h-16 text-[#52525B] mx-auto mb-4" />
          <h3 className="text-xl font-['Rajdhani'] font-bold text-white mb-2">No Special Tournaments Yet</h3>
          <p className="text-[#A1A1AA] mb-6">Create a special tournament for 13-48 teams with qualifiers, semis and finals</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary px-8 py-3 flex items-center gap-2 mx-auto">
            <Plus className="w-5 h-5" />Create First Special Tournament
          </button>
        </div>
      )}

      {/* CREATE SPECIAL MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Special Tournament" maxWidth="38rem">
        <div className="space-y-4">
          <div><label className="block text-xs text-[#A1A1AA] mb-1">Tournament Name</label>
            <input type="text" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input-dark w-full px-4 py-2 rounded" placeholder="OSG Grand Tournament Season 1"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-[#A1A1AA] mb-1">Total Teams (max 48)</label>
              <select value={form.totalTeams} onChange={e=>setForm(f=>({...f,totalTeams:e.target.value}))} className="input-dark w-full px-4 py-2 rounded">
                {[13,16,18,20,24,32,36,40,48].map(n=><option key={n} value={n}>{n} Teams</option>)}</select></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">Teams Per Qualifier</label>
              <select value={form.teamsPerQualifier} onChange={e=>setForm(f=>({...f,teamsPerQualifier:e.target.value}))} className="input-dark w-full px-4 py-2 rounded">
                {[8,10,12].map(n=><option key={n} value={n}>{n} per qualifier</option>)}</select></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">Advance Per Qualifier</label>
              <select value={form.advancePerQualifier} onChange={e=>setForm(f=>({...f,advancePerQualifier:e.target.value}))} className="input-dark w-full px-4 py-2 rounded">
                {[3,4,5,6,8].map(n=><option key={n} value={n}>Top {n} advance</option>)}</select></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">Entry Fee ₹</label>
              <input type="number" value={form.entryFee} onChange={e=>setForm(f=>({...f,entryFee:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs text-[#A1A1AA] mb-1">1st Prize ₹</label><input type="number" value={form.prize1} onChange={e=>setForm(f=>({...f,prize1:e.target.value}))} className="input-dark w-full px-3 py-2 rounded"/></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">2nd Prize ₹</label><input type="number" value={form.prize2} onChange={e=>setForm(f=>({...f,prize2:e.target.value}))} className="input-dark w-full px-3 py-2 rounded"/></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">3rd Prize ₹</label><input type="number" value={form.prize3} onChange={e=>setForm(f=>({...f,prize3:e.target.value}))} className="input-dark w-full px-3 py-2 rounded"/></div>
          </div>
          <div><label className="block text-xs text-[#A1A1AA] mb-1">Rules</label>
            <textarea rows={3} value={form.rules} onChange={e=>setForm(f=>({...f,rules:e.target.value}))} className="input-dark w-full px-4 py-2 rounded resize-none"/></div>

          {/* Preview structure */}
          <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded p-3 text-xs">
            <p className="text-[#FF6B00] font-semibold mb-2">📋 Auto-Generated Structure:</p>
            <StageFlow structure={{numQualifiers:numQ, teamsPerQualifier:teamsPerQ, advancePerQualifier:advancePerQ, needsSemis, finalsTeams:needsSemis?12:totalInSemis}} />
            <p className="text-[#52525B] mt-2">→ {numQ} qualifiers will need to be created manually after this</p>
          </div>

          <button onClick={() => createMutation.mutate({
            name: form.name, totalTeams: parseInt(form.totalTeams),
            teamsPerQualifier: parseInt(form.teamsPerQualifier),
            advancePerQualifier: parseInt(form.advancePerQualifier),
            entryFee: parseFloat(form.entryFee),
            prizePool: {'1':parseFloat(form.prize1)||0,'2':parseFloat(form.prize2)||0,'3':parseFloat(form.prize3)||0},
            perKillPrize: parseFloat(form.perKillPrize)||5,
            rules: form.rules,
          })} disabled={!form.name || createMutation.isPending} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {createMutation.isPending ? <LoadingSpinner size="sm"/> : <><Star className="w-5 h-5"/>Create Special Tournament</>}
          </button>
        </div>
      </Modal>

      {/* CREATE QUALIFIER MODAL */}
      <Modal isOpen={showQualifierModal} onClose={() => setShowQualifierModal(false)} title={`Create Qualifier ${(selectedSpecial?.qualifierTournaments?.length||0)+1}`}>
        <div className="space-y-4">
          <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded p-3 text-sm text-[#FF6B00]">
            For: <strong>{selectedSpecial?.name}</strong> — Qualifier {(selectedSpecial?.qualifierTournaments?.length||0)+1} of {selectedSpecial?.structure?.numQualifiers}
          </div>
          <div><label className="block text-xs text-[#A1A1AA] mb-1">Qualifier Name</label>
            <input type="text" value={qualForm.name} onChange={e=>setQualForm(f=>({...f,name:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"
              placeholder={`${selectedSpecial?.name} — Qualifier ${(selectedSpecial?.qualifierTournaments?.length||0)+1}`}/></div>
          <div><label className="block text-xs text-[#A1A1AA] mb-1">Date & Time</label>
            <input type="datetime-local" value={qualForm.scheduledAt} onChange={e=>setQualForm(f=>({...f,scheduledAt:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/></div>
          <div>
            <label className="block text-xs text-[#A1A1AA] mb-2">Maps (select 6 for 6 matches)</label>
            <div className="grid grid-cols-3 gap-2">
              {MAPS.map(map => {
                const sel = qualForm.selectedMaps.includes(map);
                return <button key={map} type="button" onClick={() => setQualForm(f => ({...f, selectedMaps: sel ? f.selectedMaps.filter(m=>m!==map) : [...f.selectedMaps,map]}))}
                  className={`py-2 px-3 rounded border text-xs font-medium transition-all ${sel?'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF6B00]':'bg-white/5 border-white/20 text-[#A1A1AA]'}`}>
                  {MAP_LABELS[map]}
                </button>;
              })}
            </div>
            <p className="text-xs text-[#52525B] mt-1">{qualForm.selectedMaps.length} maps selected = {qualForm.selectedMaps.length} matches</p>
          </div>
          <button onClick={() => qualMutation.mutate({specialId: selectedSpecial?.id, data: {name: qualForm.name, scheduledAt: qualForm.scheduledAt, maps: qualForm.selectedMaps}})}
            disabled={qualForm.selectedMaps.length === 0 || qualMutation.isPending} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {qualMutation.isPending ? <LoadingSpinner size="sm"/> : <><Flag className="w-4 h-4"/>Create Qualifier & Go to Score Entry</>}
          </button>
        </div>
      </Modal>

      {/* MANAGE / DETAIL MODAL */}
      <Modal isOpen={showDetailModal} onClose={() => {setShowDetailModal(false); setSelectedTeams([]);}} title={`Manage: ${selectedSpecial?.name}`} maxWidth="56rem">
        {selectedSpecial && (
          <div className="space-y-5">
            <StageFlow structure={selectedSpecial.structure} />

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Create qualifier */}
              {(selectedSpecial.qualifierTournaments?.length||0) < selectedSpecial.structure?.numQualifiers && (
                <button onClick={() => { setShowDetailModal(false); setShowQualifierModal(true); }}
                  className="p-4 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded text-left hover:bg-[#FF6B00]/20">
                  <Flag className="w-5 h-5 text-[#FF6B00] mb-2"/>
                  <div className="text-white font-semibold text-sm">Create Qualifier {(selectedSpecial.qualifierTournaments?.length||0)+1}</div>
                  <div className="text-[#52525B] text-xs">{selectedSpecial.structure?.teamsPerQualifier} teams, 6 maps</div>
                </button>
              )}

              {/* Select teams for Semi/Finals */}
              {(selectedSpecial.qualifierTournaments?.length||0) >= selectedSpecial.structure?.numQualifiers && !selectedSpecial.finalsTournamentId && (
                <>
                  {selectedSpecial.structure?.needsSemis && !selectedSpecial.semiTournaments?.length && (
                    <button onClick={() => { setStageType('SEMI'); setSelectingFrom('qualifiers'); setShowStageModal(true); setShowDetailModal(false); }}
                      className="p-4 bg-purple-500/10 border border-purple-500/30 rounded text-left hover:bg-purple-500/20">
                      <Trophy className="w-5 h-5 text-purple-400 mb-2"/>
                      <div className="text-white font-semibold text-sm">Create Semi-Finals</div>
                      <div className="text-[#52525B] text-xs">Select top teams from qualifiers</div>
                    </button>
                  )}
                  {(!selectedSpecial.structure?.needsSemis || selectedSpecial.semiTournaments?.length > 0) && (
                    <button onClick={() => { setStageType('FINALS'); setSelectingFrom(selectedSpecial.structure?.needsSemis ? 'semis' : 'qualifiers'); setShowStageModal(true); setShowDetailModal(false); }}
                      className="p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded text-left hover:bg-[#FFD700]/20">
                      <Crown className="w-5 h-5 text-[#FFD700] mb-2"/>
                      <div className="text-white font-semibold text-sm">Create Finals</div>
                      <div className="text-[#52525B] text-xs">Select top teams → auto-register & notify</div>
                    </button>
                  )}
                </>
              )}

              {selectedSpecial.finalsTournamentId && (
                <button onClick={() => navigate(`/admin/tournaments/${selectedSpecial.finalsTournamentId}`)}
                  className="p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded text-left hover:bg-[#FFD700]/20">
                  <Gift className="w-5 h-5 text-[#FFD700] mb-2"/>
                  <div className="text-white font-semibold text-sm">Go to Finals</div>
                  <div className="text-[#52525B] text-xs">Enter scores → Distribute prizes</div>
                </button>
              )}
            </div>

            {/* Qualifier links */}
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Qualifier Tournaments</h4>
              <div className="space-y-2">
                {selectedSpecial.qualifierTournaments?.map(q => (
                  <button key={q.id} onClick={() => navigate(`/admin/tournaments/${q.id}`)}
                    className="w-full flex items-center justify-between p-3 bg-white/5 rounded border border-white/10 hover:border-[#FF6B00]/50 text-left">
                    <span className="flex items-center gap-2 text-sm text-white"><Flag className="w-4 h-4 text-[#FF6B00]"/>{q.name}</span>
                    <ChevronRight className="w-4 h-4 text-[#52525B]"/>
                  </button>
                ))}
                {selectedSpecial.semiTournaments?.map(s => (
                  <button key={s.id} onClick={() => navigate(`/admin/tournaments/${s.id}`)}
                    className="w-full flex items-center justify-between p-3 bg-purple-500/5 rounded border border-purple-500/20 hover:border-purple-500/50 text-left">
                    <span className="flex items-center gap-2 text-sm text-white"><Trophy className="w-4 h-4 text-purple-400"/>{s.name}</span>
                    <ChevronRight className="w-4 h-4 text-[#52525B]"/>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* STAGE CREATION MODAL (Semi / Finals) */}
      <Modal isOpen={showStageModal} onClose={() => {setShowStageModal(false); setSelectedTeams([]);}} title={`Create ${stageType} — Select Teams`} maxWidth="56rem">
        {selectedSpecial && (
          <div className="space-y-5">
            {selectedTeams.length === 0 ? (
              <>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-sm">
                  <p className="text-blue-400 font-semibold mb-1">Step 1: Select Teams to Advance</p>
                  <p className="text-[#A1A1AA]">Select the teams from {selectingFrom} standings to advance to {stageType}. Top ranked teams auto-appear first.</p>
                </div>
                <StandingsSelector
                  specialId={selectedSpecial.id}
                  stage={selectingFrom}
                  maxSelect={stageType === 'FINALS' ? (selectedSpecial.structure?.finalsTeams || 12) : Math.ceil(selectedSpecial.structure?.numQualifiers * selectedSpecial.structure?.advancePerQualifier / 2)}
                  onSelect={handleTeamsSelected}
                  token={token}
                />
              </>
            ) : (
              <>
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <p className="text-green-400 font-semibold mb-2">✅ Step 2: {selectedTeams.length} Teams Selected</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeams.map(t => (
                      <span key={t.teamId} className="text-xs bg-white/10 text-white px-2 py-1 rounded">{t.teamName}</span>
                    ))}
                  </div>
                  <button onClick={() => setSelectedTeams([])} className="text-[#52525B] text-xs mt-2 hover:text-white underline">← Change selection</button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><label className="block text-xs text-[#A1A1AA] mb-1">Stage Name</label>
                    <input type="text" value={stageForm.name} onChange={e=>setStageForm(f=>({...f,name:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"
                      placeholder={`${selectedSpecial.name} — ${stageType}`}/></div>
                  <div><label className="block text-xs text-[#A1A1AA] mb-1">Date & Time</label>
                    <input type="datetime-local" value={stageForm.scheduledAt} onChange={e=>setStageForm(f=>({...f,scheduledAt:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/></div>
                  <div><label className="block text-xs text-[#A1A1AA] mb-1">Teams: {selectedTeams.length}</label>
                    <div className="input-dark px-4 py-2 rounded text-white opacity-60">{selectedTeams.length} teams auto-registered</div></div>
                </div>

                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-2">Maps ({stageForm.selectedMaps.length} selected = {stageForm.selectedMaps.length} matches)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {MAPS.map(map => {
                      const sel = stageForm.selectedMaps.includes(map);
                      return <button key={map} type="button" onClick={() => setStageForm(f => ({...f, selectedMaps: sel ? f.selectedMaps.filter(m=>m!==map) : [...f.selectedMaps,map]}))}
                        className={`py-2 px-3 rounded border text-xs font-medium transition-all ${sel?'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF6B00]':'bg-white/5 border-white/20 text-[#A1A1AA]'}`}>
                        {MAP_LABELS[map]}
                      </button>;
                    })}
                  </div>
                </div>

                {stageType === 'FINALS' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="block text-xs text-[#A1A1AA] mb-1">1st Prize ₹</label><input type="number" value={stageForm.prize1} onChange={e=>setStageForm(f=>({...f,prize1:e.target.value}))} className="input-dark w-full px-3 py-2 rounded"/></div>
                    <div><label className="block text-xs text-[#A1A1AA] mb-1">2nd Prize ₹</label><input type="number" value={stageForm.prize2} onChange={e=>setStageForm(f=>({...f,prize2:e.target.value}))} className="input-dark w-full px-3 py-2 rounded"/></div>
                    <div><label className="block text-xs text-[#A1A1AA] mb-1">3rd Prize ₹</label><input type="number" value={stageForm.prize3} onChange={e=>setStageForm(f=>({...f,prize3:e.target.value}))} className="input-dark w-full px-3 py-2 rounded"/></div>
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-xs text-blue-300">
                  📧 All {selectedTeams.length} qualifying teams will receive automatic notifications. Eliminated teams will receive a sorry note.
                </div>

                <button onClick={handleCreateStage} disabled={stageMutation.isPending}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  {stageMutation.isPending ? <LoadingSpinner size="sm"/> : (
                    <><Crown className="w-5 h-5"/>Create {stageType} & Auto-Register {selectedTeams.length} Teams</>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}