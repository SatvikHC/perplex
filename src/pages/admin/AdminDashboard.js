import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Trophy, Users, Wallet, Clock, TrendingUp,
  ArrowRight, Plus, Settings, ToggleLeft, ToggleRight,
  Mail, Phone, ShieldAlert, Bell, IndianRupee, BarChart3, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Skeleton } from '../../components/UIComponents';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://cheerful-wilma-hcmedia-liva-cf966d17.koyeb.app';

function Toggle({ enabled, label, desc, onToggle, loading }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all">
      <div className="flex-1">
        <p className="text-white font-medium text-sm">{label}</p>
        {desc && <p className="text-[#52525B] text-xs mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={onToggle}
        disabled={loading}
        className="flex items-center gap-2 ml-4 flex-shrink-0"
      >
        <div className={`w-12 h-6 rounded-full transition-all relative ${loading ? 'opacity-50' : ''} ${enabled ? 'bg-[#FF6B00]' : 'bg-white/10'}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${enabled ? 'left-7' : 'left-1'}`} />
        </div>
        <span className={`text-xs font-bold w-6 ${enabled ? 'text-[#FF6B00]' : 'text-[#52525B]'}`}>
          {enabled ? 'ON' : 'OFF'}
        </span>
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(null);
  const [savingKey, setSavingKey] = useState(null);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.getAdminDashboard(token),
    enabled: !!token,
    refetchInterval: 30000,
  });

  const { data: platformSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['adminPlatformSettings'],
    queryFn: () => fetch(`${API_URL}/api/admin/platform-settings`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()),
    enabled: !!token,
    onSuccess: (d) => { if (!settings) setSettings(d); }
  });

  useEffect(() => {
    if (platformSettings && !settings) {
      setSettings(platformSettings);
    }
  }, [platformSettings]);

  const handleToggle = async (key) => {
    const newSettings = { ...(settings || {}), [key]: !settings?.[key] };
    setSettings(newSettings);
    setSavingKey(key);
    try {
      await fetch(`${API_URL}/api/admin/platform-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newSettings)
      });
      toast.success(`${key === 'emailVerifyRequired' ? 'Email verify' : key === 'mobileVerifyRequired' ? 'Mobile verify' : key} ${newSettings[key] ? 'enabled' : 'disabled'}`);
      queryClient.invalidateQueries(['adminPlatformSettings']);
    } catch (e) {
      toast.error('Failed to save setting');
      setSettings(prev => ({ ...prev, [key]: !newSettings[key] }));
    } finally {
      setSavingKey(null);
    }
  };

  const handleDiscordUrlSave = async (url) => {
    const newSettings = { ...(settings || {}), discordUrl: url };
    try {
      await fetch(`${API_URL}/api/admin/platform-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newSettings)
      });
      toast.success('Discord URL saved!');
    } catch (e) {
      toast.error('Failed to save');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-['Rajdhani'] font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-[#A1A1AA]">Overview of OSG LIVE platform</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => queryClient.invalidateQueries(['adminDashboard'])}
            className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          <Link to="/admin/tournaments/create" className="btn-primary px-6 py-3 flex items-center gap-2">
            <Plus className="w-5 h-5" />New Tournament
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-lg" />)
        ) : (
          <>
            {[
              { icon: Trophy, color: '#FF6B00', value: dashboard?.stats?.activeTournaments||0, label: 'Active Tournaments' },
              { icon: Users, color: '#FFD700', value: dashboard?.stats?.todayRegistrations||0, label: "Today's Registrations" },
              { icon: IndianRupee, color: '#4ADE80', value: `₹${dashboard?.stats?.todayRevenue||0}`, label: "Today's Revenue" },
              { icon: Clock, color: '#F87171', value: dashboard?.stats?.pendingWithdrawals||0, label: 'Pending Withdrawals' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass-card rounded-lg p-6 border-l-4" style={{ borderColor: s.color }}>
                  <Icon className="w-8 h-8 mb-3" style={{ color: s.color }} />
                  <div className="text-3xl font-['Rajdhani'] font-bold text-white">{s.value}</div>
                  <p className="text-sm text-[#A1A1AA]">{s.label}</p>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* ===== PLATFORM SETTINGS — TOGGLES ===== */}
      <div className="glass-card rounded-xl p-6 border border-[#FF6B00]/20">
        <h2 className="text-xl font-['Rajdhani'] font-bold text-white mb-5 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#FF6B00]" />
          Platform Settings
          {settingsLoading && <span className="text-xs text-[#52525B] ml-2">Loading...</span>}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <Toggle
            enabled={settings?.emailVerifyRequired || false}
            label="📧 Email Verification Required"
            desc="Players must verify email to join tournaments"
            onToggle={() => handleToggle('emailVerifyRequired')}
            loading={savingKey === 'emailVerifyRequired'}
          />
          <Toggle
            enabled={settings?.mobileVerifyRequired || false}
            label="📱 Mobile Verification Required"
            desc="Players must verify mobile to join tournaments"
            onToggle={() => handleToggle('mobileVerifyRequired')}
            loading={savingKey === 'mobileVerifyRequired'}
          />
          <Toggle
            enabled={settings?.maintenanceMode || false}
            label="🔧 Maintenance Mode"
            desc="Show maintenance message to all players"
            onToggle={() => handleToggle('maintenanceMode')}
            loading={savingKey === 'maintenanceMode'}
          />
          <Toggle
            enabled={settings?.allowWithdrawals !== false}
            label="💰 Allow Withdrawals"
            desc="Players can request wallet withdrawals (₹5 platform fee)"
            onToggle={() => handleToggle('allowWithdrawals')}
            loading={savingKey === 'allowWithdrawals'}
          />
          <Toggle
            enabled={settings?.clashSquadEnabled !== false}
            label="⚔️ Clash Squad Tournaments"
            desc="Allow CS 1v1 / 2v2 / 4v4 tournament creation"
            onToggle={() => handleToggle('clashSquadEnabled')}
            loading={savingKey === 'clashSquadEnabled'}
          />
          <Toggle
            enabled={settings?.loneWolfEnabled !== false}
            label="🐺 Lone Wolf Tournaments"
            desc="Allow Lone Wolf 1v1 / 2v2 tournament creation"
            onToggle={() => handleToggle('loneWolfEnabled')}
            loading={savingKey === 'loneWolfEnabled'}
          />
        </div>

        {/* Discord URL */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <label className="block text-sm text-white font-medium mb-2">
            💬 Discord Server URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={settings?.discordUrl || 'https://discord.gg/bpXVqbBN'}
              onChange={e => setSettings(s => ({ ...s, discordUrl: e.target.value }))}
              className="input-dark flex-1 px-4 py-2 rounded text-sm"
              placeholder="https://discord.gg/..."
            />
            <button onClick={() => handleDiscordUrlSave(settings?.discordUrl || 'https://discord.gg/bpXVqbBN')}
              className="btn-primary px-4 py-2 text-sm">Save</button>
          </div>
          <p className="text-xs text-[#52525B] mt-1">Players can use this link for support. Tag @satvik4152 for help.</p>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-['Rajdhani'] font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#FF6B00]" />Recent Registrations
        </h2>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}</div>
        ) : dashboard?.recentRegistrations?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10 text-[#A1A1AA] text-xs uppercase">
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-left">Tournament</th>
                <th className="px-4 py-3 text-center">Slot</th>
                <th className="px-4 py-3 text-center">Amount</th>
                <th className="px-4 py-3 text-right">Time</th>
              </tr></thead>
              <tbody>
                {dashboard.recentRegistrations.map((reg, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-semibold text-white">{reg.teamName}</td>
                    <td className="px-4 py-3 text-[#A1A1AA] max-w-xs truncate">{reg.tournamentName}</td>
                    <td className="px-4 py-3 text-center"><span className="badge bg-[#FF6B00] text-black">#{reg.slotNumber}</span></td>
                    <td className="px-4 py-3 text-center text-[#FFD700]">₹{reg.amount}</td>
                    <td className="px-4 py-3 text-right text-[#52525B] text-xs">{reg.confirmedAt ? format(new Date(reg.confirmedAt), 'h:mm a') : '-'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-[#52525B] mx-auto mb-3" />
            <p className="text-[#A1A1AA]">No recent registrations</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/admin/tournaments/create', icon: Trophy, color: 'text-[#FF6B00]', title: 'Create Tournament', desc: 'Set up a new tournament' },
          { to: '/admin/players', icon: Users, color: 'text-[#FFD700]', title: 'Player Management', desc: 'Search and manage players' },
          { to: '/admin/withdrawals', icon: Wallet, color: 'text-green-400', title: 'Process Withdrawals', desc: 'Review pending requests (₹5 fee)' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to}
              className="glass-card rounded-lg p-6 hover:border-[#FF6B00]/50 transition-all group border border-white/10">
              <Icon className={`w-8 h-8 ${item.color} mb-3 group-hover:scale-110 transition-transform`} />
              <h3 className="font-['Rajdhani'] font-bold text-white mb-1">{item.title}</h3>
              <p className="text-sm text-[#A1A1AA]">{item.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}