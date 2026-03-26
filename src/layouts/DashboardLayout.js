import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Flame, Home, Trophy, Users, Wallet, User, Ban, 
  Bell, LogOut, Menu, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Overview', end: true },
  { to: '/dashboard/tournaments', icon: Trophy, label: 'My Tournaments' },
  { to: '/dashboard/team', icon: Users, label: 'My Team' },
  { to: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
  { to: '/dashboard/bans', icon: Ban, label: 'Bans' },
];

export default function DashboardLayout() {
  const [discordHidden, setDiscordHidden] = React.useState(() => {
    try { return localStorage.getItem('hideDiscord') === 'true'; } catch { return false; }
  });

  const hideDiscord = () => {
    localStorage.setItem('hideDiscord', 'true');
    setDiscordHidden(true);
  };
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(token),
    enabled: !!token,
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#121212] border-r border-white/10 z-50 lg:relative lg:flex lg:flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <NavLink to="/" className="flex items-center gap-2">
              <Flame className="w-8 h-8 text-[#FF6B00]" />
              <span className="text-xl font-bold font-['Rajdhani'] gradient-text">
                OSG LIVE
              </span>
            </NavLink>
          </div>

          {/* Player Card */}
          <div className="p-4 border-b border-white/10">
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF6B00] rounded-full flex items-center justify-center text-black font-bold text-lg">
                  {user?.ign?.[0] || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-['Rajdhani'] font-bold text-white truncate">
                    {user?.ign}
                  </p>
                  <p className="text-xs text-[#A1A1AA]">UID: {user?.ffUid}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded transition-all ${
                    isActive
                      ? 'bg-[#FF6B00] text-black'
                      : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-[#A1A1AA] hover:text-[#FF1A1A] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-[#121212] border-b border-white/10 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white p-2"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            {/* Wallet Balance */}
            <div className="hidden sm:block glass-card px-4 py-2 rounded">
              <span className="text-[#A1A1AA] text-sm">Balance: </span>
              <span className="text-[#FFD700] font-bold">₹{user?.walletBalance?.toFixed(2) || '0.00'}</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-[#A1A1AA] hover:text-white">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF1A1A] rounded-full text-xs flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Ban Alert */}
          {user?.activeBan && (
            <div className="mb-6 p-4 bg-[#FF1A1A]/10 border border-[#FF1A1A]/30 rounded-lg flex items-center gap-4">
              <Ban className="w-6 h-6 text-[#FF1A1A]" />
              <div>
                <p className="font-semibold text-[#FF1A1A]">Account Restricted</p>
                <p className="text-sm text-[#A1A1AA]">{user.activeBan.reason}</p>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
      {/* Discord Help Button — bottom right */}
      {!discordHidden && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          <div className="relative group">
            <a
              href="https://discord.gg/bpXVqbBN"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all"
              style={{ background: '#5865F2', boxShadow: '0 0 24px rgba(88,101,242,0.6)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.057.1 18.082.12 18.097a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
            </a>
            {/* Tooltip */}
            <div className="absolute bottom-16 right-0 bg-[#5865F2] text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-xl">
              💬 Need help? Ping @satvik4152
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#5865F2]"/>
            </div>
            {/* Hide button */}
            <button
              onClick={hideDiscord}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#333] text-[#A1A1AA] hover:bg-[#555] text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              title="Hide this button"
            >✕</button>
          </div>
        </div>
      )}
    </div>
  );
}