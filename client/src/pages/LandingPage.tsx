import React from 'react';
import {
  Dumbbell,
  Sparkles,
  TrendingUp,
  Utensils,
  ShieldCheck,
  Zap,
  ArrowRight,
  Flame,
  CheckCircle,
  BarChart3,
  HeartPulse,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#070A0E] text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation */}
      <header className="border-b border-zinc-800/80 bg-[#070A0E]/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-neon">
            <Dumbbell className="w-5 h-5 text-black font-bold transform -rotate-12" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1 font-display">
              FIT<span className="text-emerald-400">TRACK</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-semibold block -mt-1">
              AI FITNESS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black transition shadow-neon flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-16 pt-16 pb-24 overflow-hidden text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation AI Fitness & Performance OS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight font-display mb-6">
          Smarter Workouts. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
            AI-Powered Transformation.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          FitTrack merges elite sports science with advanced AI algorithms to generate tailored workout plans, track real-time lifting sessions, optimize nutrition macros, and accelerate your fitness goals.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => onNavigate('register')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition shadow-neon-strong flex items-center justify-center gap-2"
          >
            <span>Start Free Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <span>Explore Demo Account</span>
          </button>
        </div>

        {/* Hero Dashboard Preview Card */}
        <div className="relative mx-auto rounded-2xl border border-zinc-800 bg-[#0E131A] p-4 sm:p-6 shadow-2xl text-left overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-zinc-500 ml-2">fittrack-dashboard.live</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              AI ENGINE READY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-[#141A22] border border-zinc-800">
              <span className="text-xs text-zinc-400 block mb-1">Calories Burned</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">2,480 kcal</span>
              <div className="mt-2 text-[10px] text-zinc-400">Target: 2,600 kcal (95%)</div>
            </div>
            <div className="p-4 rounded-xl bg-[#141A22] border border-zinc-800">
              <span className="text-xs text-zinc-400 block mb-1">Daily Steps</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">11,240</span>
              <div className="mt-2 text-[10px] text-zinc-400">Goal: 10,000 steps ✓</div>
            </div>
            <div className="p-4 rounded-xl bg-[#141A22] border border-zinc-800">
              <span className="text-xs text-zinc-400 block mb-1">Workout Volume</span>
              <span className="text-2xl font-bold font-mono text-amber-400">8,420 kg</span>
              <div className="mt-2 text-[10px] text-zinc-400">4 Active Sets Logged</div>
            </div>
            <div className="p-4 rounded-xl bg-[#141A22] border border-zinc-800">
              <span className="text-xs text-zinc-400 block mb-1">Hydration</span>
              <span className="text-2xl font-bold font-mono text-blue-400">2,750 ml</span>
              <div className="mt-2 text-[10px] text-zinc-400">Target: 3,000 ml</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <p className="text-xs font-semibold text-emerald-300">AI Coach Live Recommendation:</p>
                <p className="text-xs text-zinc-300">
                  You lifted +5% more volume on Bench Press. Protein target adjusted to 160g for muscle protein synthesis.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline shrink-0 ml-4"
            >
              View Plan →
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 lg:px-16 py-20 border-t border-zinc-800/80 bg-[#0B0F14]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-4">
              Engineered For Serious Results
            </h2>
            <p className="text-sm text-zinc-400">
              Everything you need to plan, track, and master your fitness in one seamless platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#11161D] border border-zinc-800 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI-Powered Training Coach</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate periodized, personalized routines tailored to your fitness level, available equipment, and specific goals.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11161D] border border-zinc-800 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Workout Tracking</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Record sets, repetitions, weights, and RPE with automated interval rest timers and volume calculation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11161D] border border-zinc-800 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Nutritional Macro Intelligence</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Track calories, protein, carbs, fats, and hydration with a searchable food database and intelligent meal breakdown.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 px-6 text-center text-xs text-zinc-500">
        <p>© 2026 FitTrack. Engineered with React, Express, Prisma, and OpenAI. Built for high performance.</p>
      </footer>
    </div>
  );
};
