const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://cheerful-wilma-hcmedia-liva-cf966d17.koyeb.app';

function getHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Tournaments
  getTournaments: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_URL}/api/tournaments?${params}`);
    return res.json();
  },

  getFeaturedTournaments: async () => {
    const res = await fetch(`${API_URL}/api/tournaments/featured`);
    return res.json();
  },

  getTournament: async (id) => {
    const res = await fetch(`${API_URL}/api/tournaments/${id}`);
    return res.json();
  },

  getTournamentTeams: async (id) => {
    const res = await fetch(`${API_URL}/api/tournaments/${id}/teams`);
    return res.json();
  },

  getTournamentStandings: async (id) => {
    const res = await fetch(`${API_URL}/api/tournaments/${id}/standings`);
    return res.json();
  },

  getTournamentRoom: async (id, token) => {
    const res = await fetch(`${API_URL}/api/tournaments/${id}/room`, {
      headers: getHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  // Registration
  checkEligibility: async (tournamentId, token) => {
    const res = await fetch(`${API_URL}/api/registrations/check-eligibility?tournament_id=${tournamentId}`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    return res.json();
  },

  createRegistration: async (tournamentId, paymentMethod, token) => {
    const res = await fetch(`${API_URL}/api/registrations/create?tournament_id=${tournamentId}&payment_method=${paymentMethod}`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  // Teams
  getMyTeam: async (token) => {
    const res = await fetch(`${API_URL}/api/teams/my`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  createTeam: async (name, token) => {
    const res = await fetch(`${API_URL}/api/teams`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  inviteToTeam: async (ffUid, token) => {
    const res = await fetch(`${API_URL}/api/teams/invite`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ ffUid })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  acceptInvite: async (teamId, token) => {
    const res = await fetch(`${API_URL}/api/teams/accept/${teamId}`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  leaveTeam: async (token) => {
    const res = await fetch(`${API_URL}/api/teams/leave`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  removeMember: async (memberId, token) => {
    const res = await fetch(`${API_URL}/api/teams/member/${memberId}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  getPendingInvites: async (token) => {
    const res = await fetch(`${API_URL}/api/teams/invites`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  // Player
  getPlayerProfile: async (token) => {
    const res = await fetch(`${API_URL}/api/player/profile`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  updateProfile: async (data, token) => {
    const res = await fetch(`${API_URL}/api/player/profile`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  changePassword: async (currentPassword, newPassword, token) => {
    const res = await fetch(`${API_URL}/api/player/change-password`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  getPlayerTournaments: async (token) => {
    const res = await fetch(`${API_URL}/api/player/tournaments`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  // Wallet
  getWallet: async (token) => {
    const res = await fetch(`${API_URL}/api/player/wallet`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  createWithdrawal: async (amount, upiId, token) => {
    const res = await fetch(`${API_URL}/api/player/withdrawal`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ amount, upiId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  getWithdrawals: async (token) => {
    const res = await fetch(`${API_URL}/api/player/withdrawals`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  // Bans
  getPlayerBans: async (token) => {
    const res = await fetch(`${API_URL}/api/player/bans`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  appealBan: async (banId, appealText, token) => {
    const res = await fetch(`${API_URL}/api/player/bans/${banId}/appeal?appeal_text=${encodeURIComponent(appealText)}`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  // Notifications
  getNotifications: async (token) => {
    const res = await fetch(`${API_URL}/api/notifications`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  markNotificationRead: async (id, token) => {
    const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(token)
    });
    return res.json();
  },

  // Leaderboard
  getLeaderboard: async (period = 'all') => {
    const res = await fetch(`${API_URL}/api/leaderboard?period=${period}`);
    return res.json();
  },

  // Stats
  getGlobalStats: async () => {
    const res = await fetch(`${API_URL}/api/stats/global`);
    return res.json();
  },

  // Admin
  getAdminDashboard: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/dashboard`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  createTournament: async (data, token) => {
    const res = await fetch(`${API_URL}/api/admin/tournaments`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  updateTournament: async (id, data, token) => {
    const res = await fetch(`${API_URL}/api/admin/tournaments/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  releaseRoom: async (id, token) => {
    const res = await fetch(`${API_URL}/api/admin/tournaments/${id}/release-room`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  saveMatchResults: async (matchId, results, token) => {
    const res = await fetch(`${API_URL}/api/admin/matches/${matchId}/results`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(results)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  distributePrizes: async (tournamentId, token) => {
    const res = await fetch(`${API_URL}/api/admin/tournaments/${tournamentId}/distribute-prizes`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  getAdminPlayers: async (search, token) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_URL}/api/admin/players${params}`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  getPlayerDetail: async (id, token) => {
    const res = await fetch(`${API_URL}/api/admin/players/${id}`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  banPlayer: async (playerId, banData, token) => {
    const res = await fetch(`${API_URL}/api/admin/players/${playerId}/ban`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(banData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  unbanPlayer: async (playerId, token) => {
    const res = await fetch(`${API_URL}/api/admin/players/${playerId}/unban`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  getAdminWithdrawals: async (status, token) => {
    const params = status ? `?status=${status}` : '';
    const res = await fetch(`${API_URL}/api/admin/withdrawals${params}`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  processWithdrawal: async (id, data, token) => {
    const res = await fetch(`${API_URL}/api/admin/withdrawals/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail);
    }
    return res.json();
  },

  // Admin Appeals
  getAdminAppeals: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/appeals`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  getAppealCount: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/appeals/count`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  processAppeal: async (banId, action, note, token) => {
    const params = new URLSearchParams({ action });
    if (note) params.append('note', note);
    const res = await fetch(`${API_URL}/api/admin/appeals/${banId}?${params}`, {
      method: 'PUT',
      headers: getHeaders(token)
    });
    if (!res.ok) {
      let errMsg = 'Failed to process appeal';
      try { const e = await res.json(); errMsg = e.detail || errMsg; } catch {}
      throw new Error(errMsg);
    }
    return res.json();
  },

  clearRateLimits: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/rate-limits`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    return res.json();
  },

  // Wallet Topup
  getPaymentSettings: async () => {
    const res = await fetch(`${API_URL}/api/admin/payment-settings`);
    return res.json();
  },

  requestTopup: async (amount, utrNumber, paymentMethod, token) => {
    const res = await fetch(`${API_URL}/api/player/wallet/topup-request`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ amount, utrNumber, paymentMethod })
    });
    if (!res.ok) {
      let errMsg = 'Topup request failed';
      try { const e = await res.json(); errMsg = e.detail || errMsg; } catch {}
      throw new Error(errMsg);
    }
    return res.json();
  },

  redeemCode: async (code, token) => {
    const res = await fetch(`${API_URL}/api/player/wallet/redeem`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ code })
    });
    if (!res.ok) {
      let errMsg = 'Invalid code';
      try { const e = await res.json(); errMsg = e.detail || errMsg; } catch {}
      throw new Error(errMsg);
    }
    return res.json();
  },

  getTopupHistory: async (token) => {
    const res = await fetch(`${API_URL}/api/player/wallet/topup-history`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  // Admin Topup
  getAdminTopupRequests: async (status, token) => {
    const params = status ? `?status=${status}` : '';
    const res = await fetch(`${API_URL}/api/admin/topup-requests${params}`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  processTopupRequest: async (id, action, note, token) => {
    const params = new URLSearchParams({ action });
    if (note) params.append('note', note);
    const res = await fetch(`${API_URL}/api/admin/topup-requests/${id}?${params}`, {
      method: 'PUT',
      headers: getHeaders(token)
    });
    if (!res.ok) {
      let errMsg = 'Failed';
      try { const e = await res.json(); errMsg = e.detail || errMsg; } catch {}
      throw new Error(errMsg);
    }
    return res.json();
  },

  getPaymentSettingsFull: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/payment-settings-full`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  updatePaymentSettings: async (settings, token) => {
    const res = await fetch(`${API_URL}/api/admin/payment-settings`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  createRedeemCode: async (code, amount, maxUses, expiryHours, token) => {
    const params = new URLSearchParams({ code, amount, maxUses, expiryHours });
    const res = await fetch(`${API_URL}/api/admin/redeem-codes?${params}`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    if (!res.ok) {
      let errMsg = 'Failed to create code';
      try { const e = await res.json(); errMsg = e.detail || errMsg; } catch {}
      throw new Error(errMsg);
    }
    return res.json();
  },

  getRedeemCodes: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/redeem-codes`, {
      headers: getHeaders(token)
    });
    return res.json();
  },

  deleteRedeemCode: async (id, token) => {
    const res = await fetch(`${API_URL}/api/admin/redeem-codes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    return res.json();
  },

  // Email OTP
  sendEmailOtp: async (email) => {
    const res = await fetch(`${API_URL}/api/auth/send-email-otp?email=${encodeURIComponent(email)}`, { method: 'POST' });
    return res.json();
  },

  verifyEmailOtp: async (email, code) => {
    const res = await fetch(`${API_URL}/api/auth/verify-email-otp?email=${encodeURIComponent(email)}&code=${code}`, { method: 'POST' });
    if (!res.ok) {
      let errMsg = 'Invalid OTP';
      try { const e = await res.json(); errMsg = e.detail || errMsg; } catch {}
      throw new Error(errMsg);
    }
    return res.json();
  },

  // Test Seeding
  seedTestTournament: async () => {
    const res = await fetch(`${API_URL}/api/seed/test-tournament`, { method: 'POST' });
    return res.json();
  },

  deleteTestTournament: async () => {
    const res = await fetch(`${API_URL}/api/seed/test-tournament`, { method: 'DELETE' });
    return res.json();
  },

  seedTestUsers: async () => {
    const res = await fetch(`${API_URL}/api/seed/test-users`, { method: 'POST' });
    return res.json();
  },

  deleteTestUsers: async () => {
    const res = await fetch(`${API_URL}/api/seed/test-users`, { method: 'DELETE' });
    return res.json();
  },

  deleteTournament: async (id, token) => {
    const res = await fetch(`${API_URL}/api/admin/tournaments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    if (!res.ok) {
      let errMsg = 'Failed to delete';
      try { const e = await res.json(); errMsg = e.detail || errMsg; } catch {}
      throw new Error(errMsg);
    }
    return res.json();
  },

  // Cup Tournaments
  getCups: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/cups`, { headers: getHeaders(token) });
    return res.json();
  },
  createCupTournament: async (data, token) => {
    const res = await fetch(`${API_URL}/api/admin/cup-tournaments`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(data) });
    if (!res.ok) { let e='Failed'; try{const r=await res.json();e=r.detail||e;}catch{} throw new Error(e); }
    return res.json();
  },
  generateFinals: async (cupId, token) => {
    const res = await fetch(`${API_URL}/api/admin/cups/${cupId}/generate-finals`, { method: 'POST', headers: getHeaders(token) });
    if (!res.ok) { let e='Failed'; try{const r=await res.json();e=r.detail||e;}catch{} throw new Error(e); }
    return res.json();
  },

  // Get tournament matches for score entry
  getTournamentMatches: async (tournamentId, token) => {
    const res = await fetch(`${API_URL}/api/admin/tournaments/${tournamentId}/matches`, { headers: getHeaders(token) });
    return res.json();
  },

  // Email OTP
  sendEmailOtp: async (email) => {
    const res = await fetch(`${API_URL}/api/auth/send-email-otp?email=${encodeURIComponent(email)}`, { method: 'POST' });
    return res.json();
  },
  verifyEmailOtp: async (email, code) => {
    const res = await fetch(`${API_URL}/api/auth/verify-email-otp?email=${encodeURIComponent(email)}&code=${code}`, { method: 'POST' });
    if (!res.ok) { let e='Invalid OTP'; try{const r=await res.json();e=r.detail||e;}catch{} throw new Error(e); }
    return res.json();
  },

  // Test Seeding
  seedTestTournament: async () => {
    const res = await fetch(`${API_URL}/api/seed/test-tournament`, { method: 'POST' });
    return res.json();
  },
  deleteTestTournament: async () => {
    const res = await fetch(`${API_URL}/api/seed/test-tournament`, { method: 'DELETE' });
    return res.json();
  },
  seedTestUsers: async () => {
    const res = await fetch(`${API_URL}/api/seed/test-users`, { method: 'POST' });
    return res.json();
  },
  deleteTestUsers: async () => {
    const res = await fetch(`${API_URL}/api/seed/test-users`, { method: 'DELETE' });
    return res.json();
  },
  deleteTournament: async (id, token) => {
    const res = await fetch(`${API_URL}/api/admin/tournaments/${id}`, { method: 'DELETE', headers: getHeaders(token) });
    if (!res.ok) { let e='Failed'; try{const r=await res.json();e=r.detail||e;}catch{} throw new Error(e); }
    return res.json();
  },

  // Admin appeals
  getAdminAppeals: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/appeals`, { headers: getHeaders(token) });
    return res.json();
  },
  getAppealCount: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/appeals/count`, { headers: getHeaders(token) });
    return res.json();
  },
  processAppeal: async (banId, action, note, token) => {
    const params = new URLSearchParams({ action });
    if (note) params.append('note', note);
    const res = await fetch(`${API_URL}/api/admin/appeals/${banId}?${params}`, { method: 'PUT', headers: getHeaders(token) });
    if (!res.ok) { let e='Failed'; try{const r=await res.json();e=r.detail||e;}catch{} throw new Error(e); }
    return res.json();
  },
  clearRateLimits: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/rate-limits`, { method: 'DELETE', headers: getHeaders(token) });
    return res.json();
  },

  // Wallet Topup
  getPaymentSettings: async () => {
    const res = await fetch(`${API_URL}/api/admin/payment-settings`);
    return res.json();
  },
  requestTopup: async (amount, utrNumber, paymentMethod, token) => {
    const res = await fetch(`${API_URL}/api/player/wallet/topup-request`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify({ amount, utrNumber, paymentMethod }) });
    if (!res.ok) { let e='Failed'; try{const r=await res.json();e=r.detail||e;}catch{} throw new Error(e); }
    return res.json();
  },
  redeemCode: async (code, token) => {
    const res = await fetch(`${API_URL}/api/player/wallet/redeem`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify({ code }) });
    if (!res.ok) { let e='Invalid code'; try{const r=await res.json();e=r.detail||e;}catch{} throw new Error(e); }
    return res.json();
  },
  getTopupHistory: async (token) => {
    const res = await fetch(`${API_URL}/api/player/wallet/topup-history`, { headers: getHeaders(token) });
    return res.json();
  },
  getAdminTopupRequests: async (status, token) => {
    const params = status ? `?status=${status}` : '';
    const res = await fetch(`${API_URL}/api/admin/topup-requests${params}`, { headers: getHeaders(token) });
    return res.json();
  },
  processTopupRequest: async (id, action, note, token) => {
    const params = new URLSearchParams({ action });
    if (note) params.append('note', note);
    const res = await fetch(`${API_URL}/api/admin/topup-requests/${id}?${params}`, { method: 'PUT', headers: getHeaders(token) });
    if (!res.ok) { let e='Failed'; try{const r=await res.json();e=r.detail||e;}catch{} throw new Error(e); }
    return res.json();
  },
  getPaymentSettingsFull: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/payment-settings-full`, { headers: getHeaders(token) });
    return res.json();
  },
  updatePaymentSettings: async (settings, token) => {
    const res = await fetch(`${API_URL}/api/admin/payment-settings`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(settings) });
    return res.json();
  },
  createRedeemCode: async (code, amount, maxUses, expiryHours, token) => {
    const params = new URLSearchParams({ code, amount, maxUses, expiryHours });
    const res = await fetch(`${API_URL}/api/admin/redeem-codes?${params}`, { method: 'POST', headers: getHeaders(token) });
    if (!res.ok) { let e='Failed'; try{const r=await res.json();e=r.detail||e;}catch{} throw new Error(e); }
    return res.json();
  },
  getRedeemCodes: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/redeem-codes`, { headers: getHeaders(token) });
    return res.json();
  },
  deleteRedeemCode: async (id, token) => {
    const res = await fetch(`${API_URL}/api/admin/redeem-codes/${id}`, { method: 'DELETE', headers: getHeaders(token) });
    return res.json();
  },

  // Platform Settings
  getPlatformSettings: async () => {
    const res = await fetch(`${API_URL}/api/platform-settings`);
    return res.json();
  },
  getAdminPlatformSettings: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/platform-settings`, { headers: getHeaders(token) });
    return res.json();
  },
  updatePlatformSettings: async (data, token) => {
    const res = await fetch(`${API_URL}/api/admin/platform-settings`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(data) });
    return res.json();
  },

  // Special Tournaments
  getSpecialTournaments: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/special-tournaments`, { headers: getHeaders(token) });
    return res.json();
  },
  getSpecialTournament: async (id, token) => {
    const res = await fetch(`${API_URL}/api/admin/special-tournaments/${id}`, { headers: getHeaders(token) });
    return res.json();
  },
  createSpecialTournament: async (data, token) => {
    const res = await fetch(`${API_URL}/api/admin/special-tournaments`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(data) });
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail||'Failed'); }
    return res.json();
  },
  createQualifierForSpecial: async (specialId, data, token) => {
    const res = await fetch(`${API_URL}/api/admin/special-tournaments/${specialId}/create-qualifier`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(data) });
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail||'Failed'); }
    return res.json();
  },
  getSpecialStandings: async (specialId, stage, token) => {
    const res = await fetch(`${API_URL}/api/admin/special-tournaments/${specialId}/standings?stage=${stage}`, { headers: getHeaders(token) });
    return res.json();
  },
  createNextStage: async (specialId, data, token) => {
    const res = await fetch(`${API_URL}/api/admin/special-tournaments/${specialId}/create-next-stage`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(data) });
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail||'Failed'); }
    return res.json();
  },
  seedSpecialTest: async () => {
    const res = await fetch(`${API_URL}/api/seed/special-test`, { method: 'POST' });
    return res.json();
  },

  // Seed
  seedDatabase: async () => {
    const res = await fetch(`${API_URL}/api/seed`, { method: 'POST' });
    return res.json();
  }
};