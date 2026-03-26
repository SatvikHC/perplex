import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  ChevronLeft, Trophy, MapPin, Clock, Users, Key, Play,
  Gift, Save, AlertTriangle, Edit2, CheckCircle, BarChart3,
  Sword, Crown, Target, RotateCcw, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Skeleton, Badge, Modal, LoadingSpinner } from '../../components/UIComponents';

const PLACEMENT_POINTS = {1:12,2:9,3:8,4:7,5:6,6:5,7:4,8:3,9:2,10:1,11:0,12:0};
const MAP_LABELS = {BERMUDA:'Bermuda',PURGATORY:'Purgatory',KALAHARI:'Kalahari',ALPHINE:'Alphine',NEXTERRA:'Nexterra',SOLARA:'Solara'};
const calcPts = (kills, placement) => { const pp=PLACEMENT_POINTS[Number(placement)]||0; const kp=Number(kills)||0; return {pp,kp,total:pp+kp}; };
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://cheerful-wilma-hcmedia-liva-cf966d17.koyeb.app';

export default function AdminTournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('scores');
  const [activeMatch, setActiveMatch] = useState(0);
  const [matchData, setMatchData] = useState({});
  const [saving, setSaving] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => api.getTournament(id),
    onSuccess: (t) => {
      setRoomId(t.roomId||''); setRoomPassword(t.roomPassword||'');
      setEditData({ name:t.name, map:t.map, entryFee:t.entryFee, maxTeams:t.maxTeams, perKillPrize:t.perKillPrize, rules:t.rules||'', youtubeUrl:t.youtubeUrl||'', scheduledAt:t.scheduledAt?new Date(t.scheduledAt).toISOString().slice(0,16):'', prize1:t.prizePool?.['1']||0, prize2:t.prizePool?.['2']||0, prize3:t.prizePool?.['3']||0 });
    }
  });

  const { data: teams } = useQuery({ queryKey: ['tournamentTeams', id], queryFn: () => api.getTournamentTeams(id), enabled: !!id });

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['tournamentMatches', id],
    queryFn: () => api.getTournamentMatches(id, token),
    enabled: !!id && !!token,
    onSuccess: (data) => {
      const init = {};
      data.forEach((match, mi) => {
        init[mi] = {};
        match.teams.forEach(t => { init[mi][t.teamId] = { kills: t.kills||0, placement: t.placement||0 }; });
      });
      setMatchData(prev => {
        const merged = {...init};
        Object.keys(prev).forEach(k => { if (prev[k] && Object.keys(prev[k]).length > 0) merged[k] = prev[k]; });
        return merged;
      });
    }
  });

  const { data: standings } = useQuery({ queryKey: ['tournamentStandings', id], queryFn: () => api.getTournamentStandings(id), enabled: !!id, refetchInterval: activeTab==='standings'?15000:false });

  const updateMutation = useMutation({ mutationFn: (d) => api.updateTournament(id, d, token), onSuccess: () => { toast.success('Updated!'); queryClient.invalidateQueries(['tournament',id]); }, onError: err => toast.error(err.message) });

  const editMutation = useMutation({
    mutationFn: (d) => fetch(`${API_URL}/api/admin/tournaments/${id}/edit`, { method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body:JSON.stringify(d) }).then(async r => { if(!r.ok){const e=await r.json(); throw new Error(e.detail||'Failed');} return r.json(); }),
    onSuccess: () => { toast.success('Tournament updated!'); queryClient.invalidateQueries(['tournament',id]); setShowEditModal(false); },
    onError: err => toast.error(err.message)
  });

  const releaseRoomMutation = useMutation({ mutationFn: () => api.releaseRoom(id, token), onSuccess: () => { toast.success('Room released!'); queryClient.invalidateQueries(['tournament',id]); }, onError: err => toast.error(err.message) });
  const distributePrizesMutation = useMutation({ mutationFn: () => api.distributePrizes(id, token), onSuccess: () => { toast.success('🎉 Prizes distributed!'); queryClient.invalidateQueries(['tournament',id]); }, onError: err => toast.error(err.message) });

  const handleSaveRoom = () => { updateMutation.mutate({ roomId, roomPassword }); setShowRoomModal(false); };

  const handleScoreChange = (mi, teamId, field, val) => {
    setMatchData(prev => ({ ...prev, [mi]: { ...(prev[mi]||{}), [teamId]: { ...(prev[mi]?.[teamId]||{}), [field]: val===''?'':Number(val) } } }));
  };

  const handleSaveMatch = async (match, mi) => {
    const data = matchData[mi]||{};
    const results = (matches?.[mi]?.teams||[]).map(t => ({ teamId:t.teamId, kills:Number(data[t.teamId]?.kills)||0, placement:Number(data[t.teamId]?.placement)||0 }));
    const placed = results.filter(r=>r.placement>0);
    if (placed.length === 0) { toast.error('Set placement for at least one team!'); return; }
    const dupes = placed.map(r=>r.placement).filter((p,i,a)=>a.indexOf(p)!==i);
    if (dupes.length) { toast.error(`Duplicate placement #${dupes[0]}!`); return; }
    setSaving(mi);
    try {
      await api.saveMatchResults(match.id, results, token);
      toast.success(`Match ${mi+1} saved! ✅`);
      queryClient.invalidateQueries(['tournamentStandings',id]);
      queryClient.invalidateQueries(['tournamentMatches',id]);
    } catch(e) { toast.error(e.message); } finally { setSaving(null); }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-12 w-1/3"/><Skeleton className="h-64 rounded-lg"/></div>;
  if (!tournament) return <div className="text-center py-20"><AlertTriangle className="w-16 h-16 text-[#FF1A1A] mx-auto mb-4"/><h2 className="text-2xl font-['Rajdhani'] font-bold text-white">Not Found</h2></div>;

  const currentMatch = matches?.[activeMatch];
  const currentMatchData = matchData[activeMatch]||{};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2 rounded-full mt-1"><ChevronLeft className="w-5 h-5"/></button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-['Rajdhani'] font-bold text-white">{tournament.name}</h1>
            {tournament.tournamentType && <span className={`px-2 py-0.5 rounded text-xs font-bold ${tournament.tournamentType==='FINALS'?'bg-[#FFD700] text-black':tournament.tournamentType==='QUALIFIER'?'bg-[#FF6B00] text-black':'bg-white/10 text-white'}`}>{tournament.tournamentType}</span>}
            <Badge variant={tournament.status==='LIVE'?'danger':tournament.status==='COMPLETED'?'success':'default'}>{tournament.status}</Badge>
          </div>
          <div className="flex gap-4 text-sm text-[#A1A1AA] mt-1 flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{MAP_LABELS[tournament.map]||tournament.map}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{tournament.scheduledAt?format(new Date(tournament.scheduledAt),'MMM d, yyyy h:mm a'):'—'}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{tournament.filledSlots}/{tournament.maxTeams} teams</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-2">
        <select value={tournament.status} onChange={e=>updateMutation.mutate({status:e.target.value})} className="input-dark px-3 py-2 rounded text-sm">
          {['DRAFT','UPCOMING','REGISTERING','LIVE','COMPLETED','CANCELLED','POSTPONED'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={()=>setShowEditModal(true)} className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"><Edit2 className="w-4 h-4"/>Edit Details</button>
        <button onClick={()=>setShowRoomModal(true)} className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"><Key className="w-4 h-4"/>{tournament.roomId?'Edit Room':'Set Room'}</button>
        {tournament.roomId && !tournament.roomReleasedAt && (
          <button onClick={()=>releaseRoomMutation.mutate()} disabled={releaseRoomMutation.isPending} className="btn-primary px-4 py-2 flex items-center gap-2 text-sm">
            {releaseRoomMutation.isPending?<LoadingSpinner size="sm"/>:<><Play className="w-4 h-4"/>Release Room</>}
          </button>
        )}
        {tournament.roomReleasedAt && <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded text-green-500 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4"/>Room Released</div>}
        <button onClick={()=>{if(window.confirm('Distribute prizes to all team members?'))distributePrizesMutation.mutate();}} disabled={distributePrizesMutation.isPending}
          className="px-4 py-2 bg-[#FFD700] text-black rounded font-semibold hover:bg-yellow-400 flex items-center gap-2 text-sm disabled:opacity-50">
          {distributePrizesMutation.isPending?<LoadingSpinner size="sm"/>:<><Gift className="w-4 h-4"/>Distribute Prizes</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/10 overflow-x-auto">
        {[{key:'scores',label:'Enter Scores',icon:Edit2},{key:'standings',label:'Standings',icon:BarChart3},{key:'teams',label:'Teams',icon:Users},{key:'details',label:'Details',icon:Trophy}].map(tab=>{
          const Icon=tab.icon;
          return <button key={tab.key} onClick={()=>setActiveTab(tab.key)} className={`px-5 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-all flex-shrink-0 ${activeTab===tab.key?'border-[#FF6B00] text-[#FF6B00]':'border-transparent text-[#A1A1AA] hover:text-white'}`}><Icon className="w-4 h-4"/>{tab.label}</button>;
        })}
      </div>

      {/* SCORES TAB */}
      {activeTab === 'scores' && (
        <div className="space-y-4">
          {/* Points ref */}
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-[#FF6B00]"/><span className="text-white text-sm font-semibold">Points System</span><span className="text-[#52525B] text-xs">| Kill = 1pt | Tiebreaker = Total Kills</span></div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(PLACEMENT_POINTS).map(([p,pts])=>(
                <div key={p} className={`px-2 py-1 rounded text-xs ${pts>0?'bg-[#FF6B00]/10 border border-[#FF6B00]/20':'bg-white/5 border border-white/10'}`}>
                  <span className="text-[#A1A1AA]">#{p}</span><span className={`ml-1 font-bold ${pts>0?'text-[#FFD700]':'text-[#52525B]'}`}>{pts}pt</span>
                </div>
              ))}
            </div>
          </div>

          {matchesLoading ? <Skeleton className="h-16 rounded"/> : matches?.length > 0 ? (
            <>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {matches.map((match,idx)=>(
                  <button key={idx} onClick={()=>setActiveMatch(idx)} className={`px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0 flex items-center gap-2 transition-all ${activeMatch===idx?'bg-[#FF6B00] text-black':'bg-white/5 text-[#A1A1AA] hover:bg-white/10'}`}>
                    Match {match.matchNumber}
                    <span className="text-xs opacity-75">({MAP_LABELS[match.mapName]||match.mapName})</span>
                    {match.teams.some(t=>t.placement>0)&&<CheckCircle className="w-3 h-3 text-green-400"/>}
                  </button>
                ))}
              </div>

              {currentMatch && (
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="font-['Rajdhani'] font-bold text-white text-lg">Match {currentMatch.matchNumber} — {MAP_LABELS[currentMatch.mapName]||currentMatch.mapName}</h3>
                      <p className="text-[#52525B] text-xs">Select placement • Enter kills • Points auto-calculate • Click Save</p>
                    </div>
                    <button onClick={()=>handleSaveMatch(currentMatch,activeMatch)} disabled={saving===activeMatch} className="btn-primary px-5 py-2 flex items-center gap-2 text-sm">
                      {saving===activeMatch?<LoadingSpinner size="sm"/>:<><Save className="w-4 h-4"/>Save Match {currentMatch.matchNumber}</>}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-xs text-[#A1A1AA] uppercase">
                          <th className="px-4 py-3 text-left">Slot</th>
                          <th className="px-4 py-3 text-left">Team</th>
                          <th className="px-4 py-3 text-center w-36"><div className="flex items-center justify-center gap-1"><Crown className="w-3 h-3 text-[#FFD700]"/>Placement</div></th>
                          <th className="px-4 py-3 text-center w-24"><div className="flex items-center justify-center gap-1"><Sword className="w-3 h-3 text-[#FF6B00]"/>Kills</div></th>
                          <th className="px-4 py-3 text-center text-[#FF6B00]">Pl Pts</th>
                          <th className="px-4 py-3 text-center text-green-400">Kill Pts</th>
                          <th className="px-4 py-3 text-center text-[#FFD700] font-bold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentMatch.teams.map((team)=>{
                          const kills = currentMatchData[team.teamId]?.kills??team.kills??0;
                          const placement = currentMatchData[team.teamId]?.placement??team.placement??0;
                          const {pp,kp,total} = calcPts(kills,placement);
                          const isFirst = Number(placement)===1;
                          return (
                            <tr key={team.teamId} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${isFirst?'bg-[#FFD700]/5':''}`}>
                              <td className="px-4 py-3"><span className="text-[#FF6B00] font-bold">#{team.slotNumber}</span></td>
                              <td className="px-4 py-3"><div className="flex items-center gap-2">{isFirst&&<Crown className="w-4 h-4 text-[#FFD700]"/>}<span className="text-white font-medium">{team.teamName}</span></div></td>
                              <td className="px-4 py-3">
                                <select value={placement} onChange={e=>handleScoreChange(activeMatch,team.teamId,'placement',e.target.value)}
                                  className={`w-full text-center bg-[#1A1A1A] border rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#FFD700] ${isFirst?'border-[#FFD700]/50 text-[#FFD700]':'border-white/20 text-white'}`}>
                                  <option value="0">— Pick —</option>
                                  {Array.from({length:Math.max(currentMatch.teams.length,12)},(_,i)=>i+1).map(p=>(
                                    <option key={p} value={p}>{p}{p===1?' 🏆':p===2?' 🥈':p===3?' 🥉':''}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <input type="number" min="0" max="99" value={kills} onChange={e=>handleScoreChange(activeMatch,team.teamId,'kills',e.target.value)} onFocus={e=>e.target.select()}
                                  className="w-full text-center bg-[#1A1A1A] border border-white/20 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#FF6B00]"/>
                              </td>
                              <td className="px-4 py-3 text-center"><span className="text-[#FF6B00] font-bold">{pp}</span></td>
                              <td className="px-4 py-3 text-center"><span className="text-green-400 font-bold">{kp}</span></td>
                              <td className="px-4 py-3 text-center"><span className={`font-['Rajdhani'] font-bold text-lg ${total>0?'text-[#FFD700]':'text-[#52525B]'}`}>{total}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-white/5 border-t border-white/20">
                          <td colSpan={3} className="px-4 py-3 text-[#A1A1AA] text-xs uppercase font-semibold">Match Totals</td>
                          <td className="px-4 py-3 text-center text-[#FF6B00] font-bold">{currentMatch.teams.reduce((s,t)=>s+(Number(currentMatchData[t.teamId]?.kills)||t.kills||0),0)}</td>
                          <td/>
                          <td className="px-4 py-3 text-center text-green-400 font-bold">{currentMatch.teams.reduce((s,t)=>s+calcPts(Number(currentMatchData[t.teamId]?.kills)||0,Number(currentMatchData[t.teamId]?.placement)||0).kp,0)}</td>
                          <td className="px-4 py-3 text-center text-[#FFD700] font-['Rajdhani'] font-bold text-lg">{currentMatch.teams.reduce((s,t)=>s+calcPts(Number(currentMatchData[t.teamId]?.kills)||0,Number(currentMatchData[t.teamId]?.placement)||0).total,0)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="px-5 py-4 border-t border-white/10 flex justify-between items-center">
                    <p className="text-xs text-[#52525B]">💡 Save each match → check Standings tab for updated leaderboard</p>
                    <button onClick={()=>handleSaveMatch(currentMatch,activeMatch)} disabled={saving===activeMatch} className="btn-primary px-6 py-2 flex items-center gap-2">
                      {saving===activeMatch?<LoadingSpinner size="sm"/>:<><Save className="w-4 h-4"/>Save & Update</>}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 glass-card rounded-lg">
              <Target className="w-12 h-12 text-[#52525B] mx-auto mb-3"/>
              <p className="text-[#A1A1AA]">No teams registered yet</p>
              <p className="text-[#52525B] text-sm mt-1">Set status to REGISTERING so players can join</p>
            </div>
          )}
        </div>
      )}

      {/* STANDINGS */}
      {activeTab === 'standings' && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-['Rajdhani'] font-bold text-white text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#FF6B00]"/>Overall Standings</h3>
            <div className="flex items-center gap-3">
              <button onClick={()=>queryClient.invalidateQueries(['tournamentStandings',id])} className="text-[#A1A1AA] hover:text-white text-sm flex items-center gap-1"><RotateCcw className="w-4 h-4"/>Refresh</button>
              <button onClick={()=>{if(window.confirm('Distribute prizes now?'))distributePrizesMutation.mutate();}} disabled={distributePrizesMutation.isPending||!standings?.length}
                className="px-4 py-2 bg-[#FFD700] text-black rounded text-sm font-semibold flex items-center gap-2 disabled:opacity-40 hover:bg-yellow-400">
                {distributePrizesMutation.isPending?<LoadingSpinner size="sm"/>:<><Gift className="w-4 h-4"/>Distribute Prizes</>}
              </button>
            </div>
          </div>
          {standings?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-xs text-[#A1A1AA] uppercase">
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Team</th>
                    {(matches||[]).map((m,i)=><th key={i} className="px-3 py-3 text-center">M{m.matchNumber}</th>)}
                    <th className="px-4 py-3 text-center text-[#FF6B00]">Kills</th>
                    <th className="px-4 py-3 text-center text-[#FFD700] font-bold">TOTAL</th>
                    {tournament.prizePool?.['1']&&<th className="px-4 py-3 text-center text-green-400">Prize</th>}
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team,idx)=>(
                    <motion.tr key={team.teamId} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:idx*0.03}}
                      className={`border-b border-white/5 ${idx===0?'bg-[#FFD700]/8':idx===1?'bg-white/4':idx===2?'bg-[#FF6B00]/5':''}`}>
                      <td className="px-4 py-3"><span className={`font-['Rajdhani'] font-bold text-xl ${idx===0?'text-[#FFD700]':idx===1?'text-gray-300':idx===2?'text-orange-500':'text-[#A1A1AA]'}`}>{idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':`#${team.rank}`}</span></td>
                      <td className="px-4 py-3 text-white font-semibold">{team.teamName}</td>
                      {(matches||[]).map((m,mi)=>{
                        const md=team.matches?.[`M${m.matchNumber}`];
                        return <td key={mi} className="px-3 py-3 text-center">{md?<div><div className="text-[#FFD700] font-bold text-sm">{md.totalPoints}</div><div className="text-[#52525B] text-xs">{md.kills}K P{md.placement}</div></div>:<span className="text-[#333] text-sm">—</span>}</td>;
                      })}
                      <td className="px-4 py-3 text-center text-[#FF6B00] font-bold">{team.totalKills}</td>
                      <td className="px-4 py-3 text-center"><span className="text-[#FFD700] font-['Rajdhani'] font-bold text-xl">{team.totalPoints}</span></td>
                      {tournament.prizePool?.['1']&&<td className="px-4 py-3 text-center text-green-400 font-bold text-sm">{tournament.prizePool?.[String(team.rank)]?`₹${tournament.prizePool[String(team.rank)]}`:'-'}</td>}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16"><BarChart3 className="w-12 h-12 text-[#52525B] mx-auto mb-3"/><p className="text-[#A1A1AA]">Enter match scores to see standings</p></div>
          )}
        </div>
      )}

      {/* TEAMS */}
      {activeTab === 'teams' && (
        <div className="glass-card rounded-lg p-6">
          <h3 className="font-['Rajdhani'] font-bold text-white text-lg mb-4">Registered Teams — {teams?.length||0}/{tournament.maxTeams}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({length:tournament.maxTeams}).map((_,i)=>{
              const team=teams?.find(t=>t.slotNumber===i+1);
              return <div key={i} className={`p-4 rounded-lg text-center border ${team?'bg-[#FF6B00]/10 border-[#FF6B00]/40':'bg-white/3 border-white/10'}`}><div className={`font-['Rajdhani'] font-bold text-xl mb-1 ${team?'text-[#FF6B00]':'text-[#333]'}`}>#{i+1}</div><div className={`text-sm ${team?'text-white font-medium':'text-[#444]'}`}>{team?.teamName||'OPEN'}</div></div>;
            })}
          </div>
        </div>
      )}

      {/* DETAILS */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-lg p-6 space-y-2">
            <h3 className="font-['Rajdhani'] font-bold text-white text-lg mb-3">Info</h3>
            {[['Entry Fee',`₹${tournament.entryFee}`],['Per Kill',`₹${tournament.perKillPrize}`],['Max Teams',tournament.maxTeams],['Room ID',tournament.roomId||'—'],['Room Pass',tournament.roomPassword||'—'],['Maps',(tournament.maps||[tournament.map]).join(', ')],['Type',tournament.tournamentType||'SINGLE']].map(([k,v])=>(
              <div key={k} className="flex justify-between border-b border-white/5 pb-2"><span className="text-[#A1A1AA] text-sm">{k}</span><span className="text-white text-sm">{v}</span></div>
            ))}
          </div>
          <div className="glass-card rounded-lg p-6">
            <h3 className="font-['Rajdhani'] font-bold text-white text-lg mb-3">Prize Pool</h3>
            <div className="space-y-2">
              {Object.entries(tournament.prizePool||{}).map(([rank,prize])=>(
                <div key={rank} className="flex justify-between p-3 bg-white/5 rounded">
                  <span className="text-[#A1A1AA]">{rank==='1'?'🥇':rank==='2'?'🥈':rank==='3'?'🥉':'🏅'} #{rank}</span>
                  <span className="text-[#FFD700] font-bold">₹{prize}</span>
                </div>
              ))}
              <div className="flex justify-between p-3 bg-white/5 rounded"><span className="text-[#A1A1AA]"><Sword className="w-4 h-4 inline mr-1"/>Kill</span><span className="text-[#FF6B00] font-bold">₹{tournament.perKillPrize}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Room Modal */}
      <Modal isOpen={showRoomModal} onClose={()=>setShowRoomModal(false)} title="Set Room Details">
        <div className="space-y-4">
          <div><label className="block text-xs text-[#A1A1AA] mb-1">Room ID</label><input type="text" value={roomId} onChange={e=>setRoomId(e.target.value)} className="input-dark w-full px-4 py-3 rounded" placeholder="Room ID"/></div>
          <div><label className="block text-xs text-[#A1A1AA] mb-1">Room Password</label><input type="text" value={roomPassword} onChange={e=>setRoomPassword(e.target.value)} className="input-dark w-full px-4 py-3 rounded" placeholder="Password"/></div>
          <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded p-3 text-xs text-[#FF6B00]">⚠️ Hidden from players until you click "Release Room"</div>
          <button onClick={handleSaveRoom} disabled={!roomId||!roomPassword} className="btn-primary w-full py-3 flex items-center justify-center gap-2"><Key className="w-4 h-4"/>Save Room Details</button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={()=>setShowEditModal(false)} title="Edit Tournament" maxWidth="40rem">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-xs text-[#A1A1AA] mb-1">Name</label><input type="text" value={editData.name||''} onChange={e=>setEditData(p=>({...p,name:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">Date & Time</label><input type="datetime-local" value={editData.scheduledAt||''} onChange={e=>setEditData(p=>({...p,scheduledAt:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">Map</label><select value={editData.map||''} onChange={e=>setEditData(p=>({...p,map:e.target.value}))} className="input-dark w-full px-4 py-2 rounded">{['BERMUDA','PURGATORY','KALAHARI','ALPHINE','NEXTERRA','SOLARA'].map(m=><option key={m} value={m}>{MAP_LABELS[m]}</option>)}</select></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">Entry Fee ₹</label><input type="number" value={editData.entryFee||''} onChange={e=>setEditData(p=>({...p,entryFee:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">Per Kill ₹</label><input type="number" value={editData.perKillPrize||''} onChange={e=>setEditData(p=>({...p,perKillPrize:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">1st Prize ₹</label><input type="number" value={editData.prize1||''} onChange={e=>setEditData(p=>({...p,prize1:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">2nd Prize ₹</label><input type="number" value={editData.prize2||''} onChange={e=>setEditData(p=>({...p,prize2:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/></div>
            <div><label className="block text-xs text-[#A1A1AA] mb-1">3rd Prize ₹</label><input type="number" value={editData.prize3||''} onChange={e=>setEditData(p=>({...p,prize3:e.target.value}))} className="input-dark w-full px-4 py-2 rounded"/></div>
            <div className="col-span-2"><label className="block text-xs text-[#A1A1AA] mb-1">Rules</label><textarea rows={3} value={editData.rules||''} onChange={e=>setEditData(p=>({...p,rules:e.target.value}))} className="input-dark w-full px-4 py-2 rounded resize-none"/></div>
            <div className="col-span-2"><label className="block text-xs text-[#A1A1AA] mb-1">YouTube URL</label><input type="text" value={editData.youtubeUrl||''} onChange={e=>setEditData(p=>({...p,youtubeUrl:e.target.value}))} className="input-dark w-full px-4 py-2 rounded" placeholder="https://youtube.com/..."/></div>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>setShowEditModal(false)} className="btn-secondary flex-1 py-3">Cancel</button>
            <button onClick={()=>editMutation.mutate({name:editData.name,map:editData.map,entryFee:parseFloat(editData.entryFee),maxTeams:parseInt(editData.maxTeams),perKillPrize:parseFloat(editData.perKillPrize),rules:editData.rules,youtubeUrl:editData.youtubeUrl,scheduledAt:editData.scheduledAt?new Date(editData.scheduledAt).toISOString():undefined,prizePool:{'1':parseFloat(editData.prize1)||0,'2':parseFloat(editData.prize2)||0,'3':parseFloat(editData.prize3)||0}})}
              disabled={editMutation.isPending} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
              {editMutation.isPending?<LoadingSpinner size="sm"/>:<><Check className="w-4 h-4"/>Save Changes</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}