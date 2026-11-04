import React, { useState } from 'react';
import { Dumbbell, ArrowRight, Lock, Mail, Eye, EyeOff, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { Modal } from '../components/Modal';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.login({ email, password });
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        showToast(`Welcome back, ${res.data.user.profile?.fullName || 'Athlete'}!`, 'success');
        if (!res.data.user.profile?.onboardingCompleted) {
          onNavigate('onboarding');
        } else {
          onNavigate('dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setError(null);

    api.login({ email: demoEmail, password: demoPass })
      .then((res) => {
        if (res.success && res.data) {
          login(res.data.token, res.data.user);
          showToast(`Logged in as ${res.data.user.profile?.fullName || demoEmail}!`, 'success');
          onNavigate('dashboard');
        }
      })
      .catch((err) => {
        setError(err.message || 'Quick login failed.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await api.forgotPassword(forgotEmail);
      setForgotSuccess(res.message || 'Reset link processed.');
      showToast('Password reset link generated!', 'info');
    } catch (err: any) {
      setError(err.message);
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
          Welcome back to <span className="text-emerald-400">FitTrack</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400">
          Sign in to access your workout metrics, AI coaching, and nutrition logs
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
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@fittrack.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-700/80 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition shadow-neon flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Evaluation Logins */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-center mb-3">
              ⚡ Instant 1-Click Demo Logins
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('demo@fittrack.com', 'password123')}
                className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Demo Athlete</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@fittrack.com', 'admin123')}
                className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Portal</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-zinc-400">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-emerald-400 hover:text-emerald-300 font-bold"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => {
          setForgotModalOpen(false);
          setForgotSuccess(null);
        }}
        title="Reset Password"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            Enter your registered email address. We will simulate sending a secure reset link.
          </p>

          {forgotSuccess ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
              {forgotSuccess}
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-neon"
              >
                Send Reset Link
              </button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};
