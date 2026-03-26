import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Ban, Scale, HelpCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PageTransition } from '../components/UIComponents';

const sections = [
  {
    id: 'general',
    icon: Shield,
    title: 'General Tournament Rules',
    content: [
      'All players must have a verified OSG LIVE account with valid Free Fire UID.',
      'Teams must consist of exactly 4 registered players.',
      'All team members must be present during the match start time.',
      'Players must join the custom room within the designated time window (usually 15 minutes before match start).',
      'Match results are final once verified by tournament admins.',
      'Prize distribution occurs within 24-48 hours after tournament completion.',
    ]
  },
  {
    id: 'fair-play',
    icon: Scale,
    title: 'Fair Play & Anti-Cheat Policy',
    content: [
      'Use of any third-party cheating software, hacks, or exploits is strictly prohibited.',
      'Teaming with opponents (collusion) is not allowed.',
      'Exploiting game bugs or glitches for unfair advantage will result in disqualification.',
      'Stream sniping (watching opponent streams during match) is prohibited.',
      'All gameplay must be done on a single device owned by the registered player.',
      'VPN usage during tournaments may be restricted based on tournament rules.',
    ]
  },
  {
    id: 'ban-system',
    icon: Ban,
    title: 'Ban System',
    content: [
      {
        type: 'MATCH TERMINATION',
        duration: 'Current match only',
        description: 'Team removed from the specific match for minor violations like late joining or AFK.',
        appealable: false
      },
      {
        type: '3-DAY BAN',
        duration: '72 hours',
        description: 'For first-time minor rule violations or unsportsmanlike conduct.',
        appealable: true
      },
      {
        type: '7-DAY BAN',
        duration: '7 days',
        description: 'For repeated violations or moderate rule breaking.',
        appealable: true
      },
      {
        type: '30-DAY BAN',
        duration: '30 days',
        description: 'For serious violations like suspected cheating or harassment.',
        appealable: false
      },
      {
        type: 'PERMANENT BAN',
        duration: 'Forever',
        description: 'For confirmed cheating, fraud, or repeated serious violations. IP may also be blocked.',
        appealable: false
      }
    ]
  },
  {
    id: 'disputes',
    icon: AlertTriangle,
    title: 'Dispute Resolution',
    content: [
      'All disputes must be raised within 24 hours of match completion.',
      'Provide video evidence (screen recording) when reporting violations.',
      'Admin decisions on disputes are final and binding.',
      'False reports or abuse of the dispute system may result in penalties.',
      'Prize adjustments will be made within 48 hours of dispute resolution.',
    ]
  },
  {
    id: 'code-of-conduct',
    icon: HelpCircle,
    title: 'Code of Conduct',
    content: [
      'Treat all players, admins, and staff with respect.',
      'No hate speech, discrimination, or harassment of any kind.',
      'Do not share or trade accounts.',
      'Keep chat and communications appropriate and professional.',
      'Report any suspicious activity or rule violations to admins.',
      'Have fun and play competitively but fairly!',
    ]
  }
];

export default function RulesPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <Shield className="w-16 h-16 text-[#FF6B00] mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-['Rajdhani'] font-bold text-white mb-2">
                Tournament Rules
              </h1>
              <p className="text-[#A1A1AA]">
                Read carefully before participating in any tournament
              </p>
            </div>

            {/* Quick Nav */}
            <div className="glass-card rounded-lg p-4 mb-8">
              <div className="flex flex-wrap gap-2">
                {sections.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-sm text-[#A1A1AA] hover:text-white transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section, sectionIndex) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className="glass-card rounded-lg p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#FF6B00]/10 rounded flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <h2 className="text-2xl font-['Rajdhani'] font-bold text-white">
                      {section.title}
                    </h2>
                  </div>

                  {section.id === 'ban-system' ? (
                    <div className="space-y-4">
                      {section.content.map((ban, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded border-l-4 ${
                            ban.type === 'PERMANENT BAN' ? 'border-[#FF1A1A] bg-[#FF1A1A]/5' :
                            ban.type === '30-DAY BAN' ? 'border-orange-500 bg-orange-500/5' :
                            ban.type === '7-DAY BAN' ? 'border-yellow-500 bg-yellow-500/5' :
                            ban.type === '3-DAY BAN' ? 'border-blue-500 bg-blue-500/5' :
                            'border-[#52525B] bg-white/5'
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-['Rajdhani'] font-bold text-white">
                              {ban.type}
                            </span>
                            <span className="text-sm text-[#A1A1AA]">• {ban.duration}</span>
                            {ban.appealable && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                Appealable
                              </span>
                            )}
                          </div>
                          <p className="text-[#A1A1AA] text-sm">{ban.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {section.content.map((item, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="text-[#FF6B00] mt-1">•</span>
                          <span className="text-[#A1A1AA]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.section>
              ))}
            </div>

            {/* Agreement Note */}
            <div className="mt-12 p-6 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-lg text-center">
              <p className="text-white font-semibold mb-2">
                By registering for any tournament, you agree to follow all rules listed above.
              </p>
              <p className="text-[#A1A1AA] text-sm">
                Violation of any rule may result in penalties including bans and forfeiture of prizes.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
