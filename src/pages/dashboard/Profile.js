import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, Mail, Phone, Gamepad2, MapPin, Lock,
  Shield, CheckCircle, AlertCircle, Edit3, Send, KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Modal, LoadingSpinner } from '../../components/UIComponents';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/\d/).regex(/[!@#$%^&*(),.?":{}|<>]/),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function Profile() {
  const { user, token, refreshUser } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingIgn, setEditingIgn] = useState(false);
  const [newIgn, setNewIgn] = useState(user?.ign || '');

  // Email OTP state
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(passwordSchema) });

  const { data: platformSettings } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => api.getPlatformSettings(),
  });

  const updateIgnMutation = useMutation({
    mutationFn: (ign) => api.updateProfile({ ign }, token),
    onSuccess: () => { toast.success('IGN updated!'); refreshUser(); setEditingIgn(false); },
    onError: err => toast.error(err.message),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (d) => api.changePassword(d.currentPassword, d.newPassword, token),
    onSuccess: () => { toast.success('Password changed!'); setShowPasswordModal(false); reset(); },
    onError: err => toast.error(err.message),
  });

  const ignLastUpdated = user?.ignUpdatedAt ? new Date(user.ignUpdatedAt) : null;
  const canChangeIgn = !ignLastUpdated || (new Date() - ignLastUpdated) >= 30 * 24 * 60 * 60 * 1000;
  const daysUntilIgnChange = ignLastUpdated ? Math.max(0, 30 - Math.floor((new Date() - ignLastUpdated) / (24 * 60 * 60 * 1000))) : 0;

  const handleSendEmailOtp = async () => {
    setSendingOtp(true);
    try {
      await api.sendEmailOtp(user.email);
      setEmailOtpSent(true);
      toast.success('OTP sent to your email!');
    } catch (e) {
      toast.error(e.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length < 6) { toast.error('Enter 6-digit OTP'); return; }
    setVerifyingOtp(true);
    try {
      await api.verifyEmailOtp(user.email, emailOtp);
      toast.success('✅ Email verified!');
      setEmailOtpSent(false);
      setEmailOtp('');
      refreshUser();
    } catch (e) {
      toast.error(e.message || 'Invalid OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const emailVerifyNeeded = !user?.emailVerified;
  const mobileVerifyNeeded = !user?.mobileVerified;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-['Rajdhani'] font-bold text-white mb-1">Profile</h1>
        <p className="text-[#A1A1AA]">Manage your account</p>
      </div>

      {/* Verification Banners */}
      {emailVerifyNeeded && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/40 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-yellow-500 font-semibold text-sm">Email Not Verified</p>
                <p className="text-[#A1A1AA] text-xs">
                  {platformSettings?.emailVerifyRequired
                    ? 'Email verification is required to join tournaments'
                    : 'Verify your email to secure your account'}
                </p>
              </div>
            </div>
            {!emailOtpSent ? (
              <button onClick={handleSendEmailOtp} disabled={sendingOtp}
                className="btn-primary px-5 py-2 flex items-center gap-2 text-sm flex-shrink-0">
                {sendingOtp ? <LoadingSpinner size="sm" /> : <><Send className="w-4 h-4" />Send OTP</>}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input type="text" maxLength={6} value={emailOtp} onChange={e => setEmailOtp(e.target.value)}
                  className="input-dark px-3 py-2 rounded w-28 text-center text-lg font-bold tracking-widest"
                  placeholder="000000" />
                <button onClick={handleVerifyEmailOtp} disabled={verifyingOtp || emailOtp.length < 6}
                  className="btn-primary px-4 py-2 text-sm flex items-center gap-1">
                  {verifyingOtp ? <LoadingSpinner size="sm" /> : <><CheckCircle className="w-4 h-4" />Verify</>}
                </button>
                <button onClick={() => { setEmailOtpSent(false); setEmailOtp(''); }} className="text-[#52525B] hover:text-white text-xs">Cancel</button>
              </div>
            )}
          </div>
          {emailOtpSent && (
            <p className="text-xs text-[#52525B] mt-2 ml-8">
              OTP sent to <span className="text-white">{user.email}</span> — valid for 10 minutes.
              <button onClick={handleSendEmailOtp} disabled={sendingOtp} className="text-[#FF6B00] hover:underline ml-2">Resend</button>
            </p>
          )}
        </motion.div>
      )}

      {/* Profile Card */}
      <div className="glass-card rounded-xl p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-[#FF6B00] rounded-full flex items-center justify-center text-black text-3xl font-bold flex-shrink-0">
            {user?.ign?.[0] || 'P'}
          </div>
          <div>
            <h2 className="text-2xl font-['Rajdhani'] font-bold text-white">{user?.fullName}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {user?.emailVerified ? (
                <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Email Verified</span>
              ) : (
                <span className="text-xs text-yellow-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Email Not Verified</span>
              )}
              {user?.mobileVerified ? (
                <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Mobile Verified</span>
              ) : (
                <span className="text-xs text-[#A1A1AA] flex items-center gap-1"><AlertCircle className="w-3 h-3" />Mobile Not Verified</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="flex items-center gap-2 text-sm text-[#A1A1AA] mb-2">
              <User className="w-4 h-4" />Full Name <span className="text-[#52525B] text-xs">(Cannot be changed)</span>
            </label>
            <div className="input-dark px-4 py-3 rounded text-white opacity-60">{user?.fullName}</div>
          </div>

          {/* FF UID */}
          <div>
            <label className="flex items-center gap-2 text-sm text-[#A1A1AA] mb-2">
              <Gamepad2 className="w-4 h-4" />Free Fire UID <span className="text-[#52525B] text-xs">(Permanent)</span>
            </label>
            <div className="input-dark px-4 py-3 rounded text-white opacity-60">{user?.ffUid}</div>
          </div>

          {/* IGN */}
          <div>
            <label className="flex items-center gap-2 text-sm text-[#A1A1AA] mb-2">
              <Edit3 className="w-4 h-4" />In-Game Name (IGN)
              {!canChangeIgn && <span className="text-[#FF6B00] text-xs">{daysUntilIgnChange} days until change</span>}
              {canChangeIgn && !editingIgn && <span className="text-green-500 text-xs">Can be changed</span>}
            </label>
            {editingIgn ? (
              <div className="flex gap-2">
                <input type="text" value={newIgn} onChange={e => setNewIgn(e.target.value)} maxLength={30}
                  className="input-dark flex-1 px-4 py-3 rounded" placeholder="New IGN" />
                <button onClick={() => updateIgnMutation.mutate(newIgn)} disabled={!newIgn || updateIgnMutation.isPending}
                  className="btn-primary px-4 py-3">
                  {updateIgnMutation.isPending ? <LoadingSpinner size="sm" /> : <CheckCircle className="w-4 h-4" />}
                </button>
                <button onClick={() => setEditingIgn(false)} className="btn-secondary px-4 py-3">✕</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="input-dark flex-1 px-4 py-3 rounded text-white">{user?.ign}</div>
                {canChangeIgn && (
                  <button onClick={() => { setEditingIgn(true); setNewIgn(user?.ign || ''); }}
                    className="btn-secondary px-4 py-3"><Edit3 className="w-4 h-4" /></button>
                )}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm text-[#A1A1AA] mb-2">
              <Mail className="w-4 h-4" />Email
              {user?.emailVerified
                ? <span className="text-green-500 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" />Verified</span>
                : <span className="text-yellow-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />Not Verified</span>}
            </label>
            <div className="flex gap-2">
              <div className="input-dark flex-1 px-4 py-3 rounded text-white opacity-70">{user?.email}</div>
              {!user?.emailVerified && !emailOtpSent && (
                <button onClick={handleSendEmailOtp} disabled={sendingOtp} className="btn-primary px-3 py-2 text-xs flex items-center gap-1 flex-shrink-0">
                  {sendingOtp ? <LoadingSpinner size="sm" /> : <><Send className="w-3 h-3" />Verify</>}
                </button>
              )}
              {!user?.emailVerified && emailOtpSent && (
                <button onClick={() => setEmailOtpSent(false)} className="btn-secondary px-3 py-2 text-xs flex-shrink-0">Enter OTP ↑</button>
              )}
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="flex items-center gap-2 text-sm text-[#A1A1AA] mb-2">
              <Phone className="w-4 h-4" />Mobile <span className="text-[#52525B] text-xs">(Cannot be changed)</span>
            </label>
            <div className="input-dark px-4 py-3 rounded text-white opacity-60">{user?.mobile}</div>
          </div>

          {/* State */}
          <div>
            <label className="flex items-center gap-2 text-sm text-[#A1A1AA] mb-2">
              <MapPin className="w-4 h-4" />State
            </label>
            <div className="input-dark px-4 py-3 rounded text-white opacity-70">{user?.state}</div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-['Rajdhani'] font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#FF6B00]" />Security
        </h2>
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6B00]/20 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <div>
              <p className="text-white font-medium">Password</p>
              <p className="text-[#52525B] text-xs">Last changed: Unknown</p>
            </div>
          </div>
          <button onClick={() => setShowPasswordModal(true)}
            className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm">
            <KeyRound className="w-4 h-4" />Change Password
          </button>
        </div>
      </div>

      {/* Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => { setShowPasswordModal(false); reset(); }} title="Change Password">
        <form onSubmit={handleSubmit(d => changePasswordMutation.mutate(d))} className="space-y-4">
          {[
            { name: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
            { name: 'newPassword', label: 'New Password', placeholder: 'Min 8 chars, uppercase, number, special' },
            { name: 'confirmPassword', label: 'Confirm New Password', placeholder: '••••••••' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm text-[#A1A1AA] mb-2">{field.label}</label>
              <input type="password" {...register(field.name)} className="input-dark w-full px-4 py-3 rounded" placeholder={field.placeholder} />
              {errors[field.name] && <p className="text-[#FF1A1A] text-xs mt-1">{errors[field.name].message}</p>}
            </div>
          ))}
          <button type="submit" disabled={changePasswordMutation.isPending} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {changePasswordMutation.isPending ? <LoadingSpinner size="sm" /> : 'Change Password'}
          </button>
        </form>
      </Modal>
    </div>
  );
}