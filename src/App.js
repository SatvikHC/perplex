import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import BanPopup from './components/BanPopup';
import { api } from './lib/api';

// Public pages
import LandingPage from './pages/LandingPage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import RulesPage from './pages/RulesPage';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Dashboard pages
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import MyTournaments from './pages/dashboard/MyTournaments';
import MyTeam from './pages/dashboard/MyTeam';
import Wallet from './pages/dashboard/Wallet';
import Profile from './pages/dashboard/Profile';
import Bans from './pages/dashboard/Bans';

// Admin pages
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTournaments from './pages/admin/AdminTournaments';
import AdminTournamentCreate from './pages/admin/AdminTournamentCreate';
import AdminTournamentDetail from './pages/admin/AdminTournamentDetail';
import AdminPlayers from './pages/admin/AdminPlayers';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminCupTournaments from './pages/admin/AdminCupTournaments';
import AdminSpecialTournaments from './pages/admin/AdminSpecialTournaments';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Global Ban Popup Handler - shown to banned players, cannot be dismissed
function GlobalBanHandler() {
  const { activeBan, showBanPopup, logout, token, refreshUser } = useAuth();
  
  const handleAppeal = async (banId, appealText) => {
    await api.appealBan(banId, appealText, token);
    refreshUser(); // Refresh to get updated appeal status
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!showBanPopup || !activeBan) return null;
  
  return (
    <BanPopup 
      ban={activeBan}
      onAppeal={handleAppeal}
      onLogout={handleLogout}
    />
  );
}

// Protected route wrapper
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <GlobalBanHandler />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/rules" element={<RulesPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardOverview />} />
              <Route path="tournaments" element={<MyTournaments />} />
              <Route path="team" element={<MyTeam />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="profile" element={<Profile />} />
              <Route path="bans" element={<Bans />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="tournaments" element={<AdminTournaments />} />
              <Route path="tournaments/create" element={<AdminTournamentCreate />} />
              <Route path="tournaments/:id" element={<AdminTournamentDetail />} />
              <Route path="players" element={<AdminPlayers />} />
              <Route path="withdrawals" element={<AdminWithdrawals />} />
              <Route path="cups" element={<AdminCupTournaments />} />
              <Route path="special" element={<AdminSpecialTournaments />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#121212',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;