import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Flame, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageTransition, LoadingSpinner } from '../components/UIComponents';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or mobile is required'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.identifier, data.password);
      toast.success('Welcome back!');
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
              Welcome Back
            </h1>
            <p className="text-[#A1A1AA] text-center mb-8">
              Login to your account
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email/Mobile */}
              <div>
                <label className="block text-sm text-[#A1A1AA] mb-2">
                  Email or Mobile
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                  <input
                    {...register('identifier')}
                    type="text"
                    className="input-dark w-full pl-12 pr-4 py-3 rounded"
                    placeholder="Enter email or mobile"
                    data-testid="login-identifier"
                  />
                </div>
                {errors.identifier && (
                  <p className="text-[#FF1A1A] text-sm mt-1">{errors.identifier.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-[#A1A1AA] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="input-dark w-full pl-12 pr-12 py-3 rounded"
                    placeholder="Enter password"
                    data-testid="login-password"
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
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-[#FF6B00] hover:underline">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                data-testid="login-submit"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Login'}
              </button>
            </form>

            {/* Register Link */}
            <p className="text-center text-[#A1A1AA] mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#FF6B00] hover:underline">
                Register
              </Link>
            </p>
          </div>

          {/* Admin Link */}
          <p className="text-center text-[#52525B] mt-6 text-sm">
            <Link to="/admin/login" className="hover:text-[#A1A1AA]">
              Admin Login
            </Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
