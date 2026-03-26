import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Mail, Twitter, Youtube, Instagram, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-8 h-8 text-[#FF6B00]" />
              <span className="text-2xl font-bold font-['Rajdhani'] gradient-text">
                OSG LIVE
              </span>
            </div>
            <p className="text-[#A1A1AA] max-w-md">
              India's premier Free Fire esports tournament platform. Compete, win, and become a legend.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-[#A1A1AA] hover:text-[#FF6B00] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#A1A1AA] hover:text-[#FF6B00] transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#A1A1AA] hover:text-[#FF6B00] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#A1A1AA] hover:text-[#FF6B00] transition-colors">
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Rajdhani'] font-bold text-lg mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/tournaments" className="text-[#A1A1AA] hover:text-[#FF6B00] transition-colors">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-[#A1A1AA] hover:text-[#FF6B00] transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/rules" className="text-[#A1A1AA] hover:text-[#FF6B00] transition-colors">
                  Rules
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-[#A1A1AA] hover:text-[#FF6B00] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-['Rajdhani'] font-bold text-lg mb-4 text-white">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[#A1A1AA] hover:text-[#FF6B00] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A1A1AA] hover:text-[#FF6B00] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A1A1AA] hover:text-[#FF6B00] transition-colors">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="mailto:support@osglive.in" className="text-[#A1A1AA] hover:text-[#FF6B00] transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@osglive.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-[#52525B]">
          <p>&copy; {new Date().getFullYear()} OSG LIVE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
