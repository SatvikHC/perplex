import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trophy, Plus, ChevronRight, Zap, Crown, Flag, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Modal, LoadingSpinner, Badge, Skeleton } from '../../components/UIComponents';

const MAPS = ['BERMUDA','PURGATORY','KALAHARI','ALPHINE','NEXTERRA','SOLARA'];
const MAP_LABELS = {BERMUDA:'Bermuda',PURGATORY:'Purgatory',KALAHARI:'Kalahari',ALPHINE:'Alphine',NEXTERRA:'Nexterra',SOLARA:'Solara'};

export default function AdminCupTournaments() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    name: '', numQualifiers: 2, teamsPerQualifier: 12,
    selectedMaps: ['BERMUDA','PURGATORY','KALAHARI'],
    finalsTeams: 6, entryFee: 50,
    prize1: 1000, prize2: 500, prize3: 300,
    perKillPrize: 5, rules: 'Standard OSG Cup rules apply.',
    scheduledAt: ''
  });

  const { data: cups, isLoading } = useQuery({
    queryKey: ['cups'],
    queryFn: () => api.getCups(token),
    enabled: !!token
  });

  const createMutation = useMutation({
    mutationFn: () => api.createCupTournament({
      ...form,
      mapsPerQualifier: form.selectedMaps,
      prizePool: {'1': parseFloat(form.prize1), '2': parseFloat(form.prize2), '3': parseFloat(form.prize3)},
    }, token),
    onSuccess: (data) => {
      toast.success(`Cup created! ${data.tournaments.length} qualifiers generated.`);
      queryClient.invalidateQueries(['cups']);
      queryClient.invalidateQueries(['tournaments']);
      setShowCreateModal(false);
    },
    onError: err => toast.error(err.message)
  });

  const finalsMutation = useMutation({
    mutationFn: (cupId) => api.generateFinals(cupId, token),
    onSuccess: (data) => {
      toast.success(`Finals created! ${data.advancingTeams.length} teams advancing.`);
      queryClient.invalidateQueries(['cups']);
      queryClient.invalidateQueries(['tournaments']);
    },
    onError: err => toast.error(err.message)
  });

  const toggleMap = (map) => {
    setForm(prev => ({
      ...prev,
      selectedMaps: prev.selectedMaps.includes(map)
        ? prev.selectedMaps.filter(m => m !== map)
        : [...prev.selectedMaps, map]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-['Rajdhani'] font-bold text-white mb-1">Cup Tournaments</h1>
          <p className="text-[#A1A1AA]">Qualifiers → Finals system with auto-advancement</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary px-6 py-3 flex items-center gap-2">
          <Plus className="w-5 h-5" />Create Cup
        </button>
      </div>

      {/* How it works */}
      <div className="glass-card rounded-lg p-5 border border-[#FF6B00]/20">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-[#FF6B00]"/>How Cup Tournaments Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          {[
            {icon:'1️⃣', label:'Create Cup', desc:'Set qualifiers count, maps, teams per qualifier'},
            {icon:'2️⃣', label:'Qualifiers Run', desc:'Each qualifier: 12 teams, 3 maps back to back'},
            {icon:'3️⃣', label:'Enter Scores', desc:'Enter kills + placement for each match in each qualifier'},
            {icon:'4️⃣', label:'Generate Finals', desc:'Top 6 teams auto-advance, Finals created automatically'},
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded p-3 border border-white/10">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-white font-semibold text-xs mb-1">{s.label}</div>
              <div className="text-[#52525B] text-xs">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cup List */}
      {isLoading ? (
        <div className="space-y-4">{[1,2].map(i=><Skeleton key={i} className="h-32 rounded-lg"/>)}</div>
      ) : cups?.length > 0 ? (
        <div className="space-y-4">
          {cups.map((cup, idx) => (
            <motion.div key={cup.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}
              className="glass-card rounded-xl p-6 border border-white/10">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-5 h-5 text-[#FFD700]"/>
                    <h3 className="text-xl font-['Rajdhani'] font-bold text-white">{cup.name}</h3>
                    <Badge variant={cup.status==='LIVE'?'danger':cup.status==='COMPLETED'?'success':'default'}>{cup.status}</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-[#A1A1AA] flex-wrap">
                    <span>{cup.numQualifiers} Qualifiers</span>
                    <span>{cup.teamsPerQualifier} teams each</span>
                    <span>{(cup.mapsPerQualifier||[]).length} maps per qualifier</span>
                    <span>Finals: Top {cup.finalsTeams} teams</span>
                  </div>
                </div>
                {!cup.finalsGenerated && cup.qualifierCount >= cup.numQualifiers && (
                  <button onClick={() => { if(window.confirm('Generate Finals from qualifier results?')) finalsMutation.mutate(cup.id); }}
                    disabled={finalsMutation.isPending}
                    className="px-5 py-2 bg-[#FFD700] text-black rounded font-bold flex items-center gap-2 hover:bg-yellow-400 text-sm">
                    {finalsMutation.isPending ? <Loader className="w-4 h-4 animate-spin"/> : <><Crown className="w-4 h-4"/>Generate Finals</>}
                  </button>
                )}
                {cup.finalsGenerated && (
                  <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4"/>Finals Generated
                  </div>
                )}
              </div>

              {/* Qualifier List */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cup.qualifiers?.map(q => (
                  <button key={q.id} onClick={() => navigate(`/admin/tournaments/${q.id}`)}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-[#FF6B00]/50 text-left transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Flag className="w-4 h-4 text-[#FF6B00]"/>
                          <span className="text-white font-semibold text-sm">{q.name}</span>
                        </div>
                        <Badge variant={q.status==='LIVE'?'danger':q.status==='COMPLETED'?'success':'default'} className="mt-1 text-xs">{q.status}</Badge>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#52525B] group-hover:text-[#FF6B00]"/>
                    </div>
                  </button>
                ))}
                {cup.finals && (
                  <button onClick={() => navigate(`/admin/tournaments/${cup.finals.id}`)}
                    className="p-4 bg-[#FFD700]/10 rounded-lg border border-[#FFD700]/30 hover:border-[#FFD700] text-left transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-[#FFD700]"/>
                          <span className="text-[#FFD700] font-semibold text-sm">{cup.finals.name}</span>
                        </div>
                        <Badge variant="warning" className="mt-1 text-xs">{cup.finals.status}</Badge>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#FFD700]"/>
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card rounded-xl">
          <Trophy className="w-16 h-16 text-[#52525B] mx-auto mb-4"/>
          <h3 className="text-xl font-['Rajdhani'] font-bold text-white mb-2">No Cups Yet</h3>
          <p className="text-[#A1A1AA] mb-6">Create your first Cup tournament with qualifiers and finals</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary px-8 py-3 flex items-center gap-2 mx-auto">
            <Plus className="w-5 h-5"/>Create First Cup
          </button>
        </div>
      )}

      {/* Create Cup Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Cup Tournament" maxWidth="38rem">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#A1A1AA] mb-1">Cup Name</label>
            <input type="text" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
              className="input-dark w-full px-4 py-2 rounded" placeholder="OSG Grand Cup Season 1"/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#A1A1AA] mb-1">Number of Qualifiers</label>
              <select value={form.numQualifiers} onChange={e=>setForm(p=>({...p,numQualifiers:Number(e.target.value)}))} className="input-dark w-full px-4 py-2 rounded">
                {[1,2,3,4].map(n=><option key={n} value={n}>{n} Qualifier{n>1?'s':''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#A1A1AA] mb-1">Teams Per Qualifier</label>
              <select value={form.teamsPerQualifier} onChange={e=>setForm(p=>({...p,teamsPerQualifier:Number(e.target.value)}))} className="input-dark w-full px-4 py-2 rounded">
                {[6,8,10,12].map(n=><option key={n} value={n}>{n} Teams</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#A1A1AA] mb-1">Finals Teams (total)</label>
              <select value={form.finalsTeams} onChange={e=>setForm(p=>({...p,finalsTeams:Number(e.target.value)}))} className="input-dark w-full px-4 py-2 rounded">
                {[4,6,8,12].map(n=><option key={n} value={n}>{n} Teams ({Math.ceil(n/form.numQualifiers)} per Q)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#A1A1AA] mb-1">Entry Fee ₹</label>
              <input type="number" value={form.entryFee} onChange={e=>setForm(p=>({...p,entryFee:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/>
            </div>
          </div>

          {/* Map Selector */}
          <div>
            <label className="block text-xs text-[#A1A1AA] mb-2">
              Maps Per Qualifier ({form.selectedMaps.length} selected)
              <span className="text-[#52525B] ml-2">— each selected map = 1 match</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MAPS.map(map => (
                <button key={map} type="button" onClick={() => toggleMap(map)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    form.selectedMaps.includes(map)
                      ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF6B00]'
                      : 'bg-white/5 border-white/20 text-[#A1A1AA] hover:border-white/40'
                  }`}>
                  <div className="flex items-center justify-between">
                    <span>{MAP_LABELS[map]}</span>
                    {form.selectedMaps.includes(map) && <CheckCircle className="w-4 h-4"/>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prize Pool */}
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs text-[#A1A1AA] mb-1">1st Prize ₹</label><input type="number" value={form.prize1} onChange={e=>setForm(p=>({...p,prize1:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">2nd Prize ₹</label><input type="number" value={form.prize2} onChange={e=>setForm(p=>({...p,prize2:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">Per Kill ₹</label><input type="number" value={form.perKillPrize} onChange={e=>setForm(p=>({...p,perKillPrize:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/></div>
          </div>

          <div>
            <label className="block text-xs text-[#A1A1AA] mb-1">Start Date</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={e=>setForm(p=>({...p,scheduledAt:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/>
          </div>

          {/* Preview */}
          <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded p-3 text-xs text-[#FF6B00]">
            📋 This will create: {form.numQualifiers} qualifier tournament{form.numQualifiers>1?'s':''} × {form.selectedMaps.length} matches each.
            Top {Math.ceil(form.finalsTeams/form.numQualifiers)} teams per qualifier advance to Finals ({form.finalsTeams} total).
          </div>

          <button onClick={() => createMutation.mutate()} disabled={!form.name || form.selectedMaps.length === 0 || createMutation.isPending}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {createMutation.isPending ? <LoadingSpinner size="sm"/> : <><Trophy className="w-5 h-5"/>Create Cup Tournament</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}