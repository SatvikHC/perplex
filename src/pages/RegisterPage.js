import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Flame, User, Mail, Phone, Lock, Eye, EyeOff, 
  Gamepad2, MapPin, Calendar, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageTransition, LoadingSpinner } from '../components/UIComponents';

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/\d/, 'Must contain a number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain special character'),
  confirmPassword: z.string(),
  ffUid: z.string().regex(/^\d{9,12}$/, 'FF UID must be 9-12 digits'),
  ign: z.string().min(2, 'IGN must be at least 2 characters').max(30),
  state: z.string().min(1, 'Select your state'),
  dob: z.string().min(1, 'Date of birth is required'),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const { register, handleSubmit, formState: { errors }, trigger, watch } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const validateStep = async () => {
    let fields;
    if (step === 1) {
      fields = ['fullName', 'email', 'mobile', 'dob', 'state'];
    } else if (step === 2) {
      fields = ['ffUid', 'ign'];
    } else {
      fields = ['password', 'confirmPassword', 'terms'];
    }
    
    const valid = await trigger(fields);
    if (valid) {
      setStep(step + 1);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
        ffUid: data.ffUid,
        ign: data.ign,
        state: data.state,
        dob: data.dob,
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <Flame className="w-10 h-10 text-[#FF6B00]" />
            <span className="text-2xl font-bold font-['Rajdhani'] gradient-text">
              OSG LIVE
            </span>
          </Link>

          {/* Form Card */}
          <div className="glass-card rounded-lg p-8">
            <h1 className="text-2xl font-['Rajdhani'] font-bold text-white text-center mb-2">
              Create Account
            </h1>
            <p className="text-[#A1A1AA] text-center mb-6">
              Join OSG LIVE and compete for glory
            </p>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex-1">
                  <div className={`h-1 rounded ${s <= step ? 'bg-[#FF6B00]' : 'bg-white/10'}`} />
                  <p className={`text-xs mt-1 ${s === step ? 'text-[#FF6B00]' : 'text-[#52525B]'}`}>
                    {s === 1 ? 'Personal' : s === 2 ? 'Gaming' : 'Security'}
                  </p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm text-[#A1A1AA] mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                      <input
                        {...register('fullName')}
                        className="input-dark w-full pl-12 pr-4 py-3 rounded"
                        placeholder="Your real name"
                        data-testid="register-fullname"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-[#FF1A1A] text-sm mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-[#A1A1AA] mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                      <input
                        {...register('email')}
                        type="email"
                        className="input-dark w-full pl-12 pr-4 py-3 rounded"
                        placeholder="your@email.com"
                        data-testid="register-email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[#FF1A1A] text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-[#A1A1AA] mb-2">Mobile</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                      <input
                        {...register('mobile')}
                        type="tel"
                        className="input-dark w-full pl-12 pr-4 py-3 rounded"
                        placeholder="10-digit mobile"
                        data-testid="register-mobile"
                      />
                    </div>
                    {errors.mobile && (
                      <p className="text-[#FF1A1A] text-sm mt-1">{errors.mobile.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#A1A1AA] mb-2">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                        <input
                          {...register('dob')}
                          type="date"
                          className="input-dark w-full pl-12 pr-4 py-3 rounded"
                          data-testid="register-dob"
                        />
                      </div>
                      {errors.dob && (
                        <p className="text-[#FF1A1A] text-sm mt-1">{errors.dob.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-[#A1A1AA] mb-2">State</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                        <select
                          {...register('state')}
                          className="input-dark w-full pl-12 pr-4 py-3 rounded appearance-none"
                          data-testid="register-state"
                        >
                          <option value="">Select</option>
                          {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      {errors.state && (
                        <p className="text-[#FF1A1A] text-sm mt-1">{errors.state.message}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Gaming Info */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm text-[#A1A1AA] mb-2">
                      Free Fire UID
                      <span className="text-[#FF6B00] ml-1">(Permanent - Cannot be changed)</span>
                    </label>
                    <div className="relative">
                      <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                      <input
                        {...register('ffUid')}
                        className="input-dark w-full pl-12 pr-4 py-3 rounded"
                        placeholder="9-12 digit UID"
                        data-testid="register-ffuid"
                      />
                    </div>
                    {errors.ffUid && (
                      <p className="text-[#FF1A1A] text-sm mt-1">{errors.ffUid.message}</p>
                    )}
                    <p className="text-xs text-[#52525B] mt-1">
                      Find your UID in Free Fire: Profile → Top left corner
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-[#A1A1AA] mb-2">
                      In-Game Name (IGN)
                      <span className="text-[#52525B] ml-1">(Changeable every 30 days)</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                      <input
                        {...register('ign')}
                        className="input-dark w-full pl-12 pr-4 py-3 rounded"
                        placeholder="Your in-game name"
                        data-testid="register-ign"
                      />
                    </div>
                    {errors.ign && (
                      <p className="text-[#FF1A1A] text-sm mt-1">{errors.ign.message}</p>
                    )}
                  </div>

                  <div className="p-4 bg-[#FF6B00]/10 rounded border border-[#FF6B00]/30">
                    <p className="text-sm text-[#A1A1AA]">
                      <strong className="text-white">Important:</strong> Your FF UID is permanent and cannot be changed. 
                      Make sure you enter the correct UID of your main Free Fire account.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Security */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm text-[#A1A1AA] mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="input-dark w-full pl-12 pr-12 py-3 rounded"
                        placeholder="Create password"
                        data-testid="register-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[#FF1A1A] text-sm mt-1">{errors.password.message}</p>
                    )}
                    <p className="text-xs text-[#52525B] mt-1">
                      8+ chars, uppercase, number, special character
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-[#A1A1AA] mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                      <input
                        {...register('confirmPassword')}
                        type={showPassword ? 'text' : 'password'}
                        className="input-dark w-full pl-12 pr-4 py-3 rounded"
                        placeholder="Confirm password"
                        data-testid="register-confirm-password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[#FF1A1A] text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <label className="flex items-start gap-3">
                    <input
                      {...register('terms')}
                      type="checkbox"
                      className="mt-1"
                      data-testid="register-terms"
                    />
                    <span className="text-sm text-[#A1A1AA]">
                      I accept the{' '}
                      <Link to="/rules" className="text-[#FF6B00] hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <a href="#" className="text-[#FF6B00] hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-[#FF1A1A] text-sm">{errors.terms.message}</p>
                  )}
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex gap-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="btn-ghost flex-1 py-3 flex items-center justify-center gap-2 border border-white/10 rounded"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={validateStep}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                    data-testid="register-submit"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                  </button>
                )}
              </div>
            </form>

            {/* Login Link */}
            <p className="text-center text-[#A1A1AA] mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-[#FF6B00] hover:underline">
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
