import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Lock, Mail, ArrowRight, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, loginAsGuest, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      const res = await register(email, password);
      if (res.success) {
        navigate('/progress');
      } else {
        setError(res.error || 'Registration failed');
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        navigate('/progress');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    }
    setLoading(false);
  };

  const handleGuest = async () => {
    await loginAsGuest();
    navigate('/progress');
  };

  return (
    <div className="w-full min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-accent/20 blur-[60px] pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,69,0,0.25)]">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isRegister ? 'Join FitForge' : 'Welcome Back'}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm mt-1">
            {isRegister
              ? 'Create an account to save your plans, logs & progress'
              : 'Sign in to access your workout and nutrition logs'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button-accent text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <span className="relative bg-[#0d121c] px-3 text-xs text-gray-400 uppercase font-semibold">Or</span>
        </div>

        {/* Guest Mode Button */}
        <button
          onClick={handleGuest}
          type="button"
          className="w-full bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 border border-white/10 shadow-sm"
        >
          <UserCheck className="w-4 h-4 text-accent" />
          <span>Continue as Guest (No password needed)</span>
        </button>

        {/* Switch Toggle */}
        <div className="mt-6 text-center text-xs text-gray-400">
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-accent hover:underline font-bold ml-1"
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
