import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Menu, X, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { href: '/tournaments', label: 'Tournaments' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/rules', label: 'Rules' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="relative"
            >
              <Flame className="w-8 h-8 text-[#FF6B00]" />
              <div className="absolute inset-0 bg-[#FF6B00] blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            </motion.div>
            <span className="text-xl font-bold font-['Rajdhani'] gradient-text">
              OSG LIVE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-[#A1A1AA] hover:text-white font-medium uppercase tracking-wide text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-[#A1A1AA] hover:text-white flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="font-['Rajdhani'] font-semibold">{user.ign}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-ghost p-2 rounded"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost px-4 py-2 rounded">
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-6 py-2">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: mobileOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden bg-[#0A0A0A] border-t border-white/10"
      >
        <div className="px-4 py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="block text-[#A1A1AA] hover:text-white font-medium uppercase tracking-wide text-sm"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/10 space-y-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-white font-['Rajdhani'] font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="text-[#A1A1AA]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-[#A1A1AA]"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block btn-primary px-4 py-2 text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </nav>
  );
}
