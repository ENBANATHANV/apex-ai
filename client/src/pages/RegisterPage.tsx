import React, { useState } from 'react';
import { Dumbbell, ArrowRight, Lock, Mail, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useNotification();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPasswordValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.register({ fullName, email, password });
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        showToast('Account created! Welcome to FitTrack.', 'success');
        onNavigate('onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0E] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-3 cursor-pointer group mb-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-neon">
            <Dumbbell className="w-6 h-6 text-black font-bold transform -rotate-12 group-hover:rotate-0 transition duration-300" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
          Join <span className="text-emerald-400">FitTrack</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400">
          Create your athlete profile and start your AI-optimized fitness journey
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#11161D] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-700/80 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-700/80 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-700/80 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <div
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    password.length === 0
                      ? 'bg-zinc-800'
                      : password.length < 6
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="text-[10px] text-zinc-400 font-mono">
                  {password.length < 6 ? 'Min 6 chars' : 'Ready'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition shadow-neon flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-400">
            Already registered?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-emerald-400 hover:text-emerald-300 font-bold"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
