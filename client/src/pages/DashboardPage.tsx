import React, { useState, useEffect } from 'react';
import {
  Flame,
  Footprints,
  Clock,
  Droplet,
  Plus,
  Play,
  TrendingUp,
  Target,
  Sparkles,
  ChevronRight,
  Quote,
  Activity,
  Dumbbell,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onStartWorkout: (planId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onStartWorkout,
}) => {
  const { profile } = useAuth();
  const { showToast } = useNotification();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboardSummary();
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickWaterAdd = async () => {
    try {
      await api.logWater(250);
      showToast('Added 250ml to today’s hydration log! 💧', 'success');
      fetchDashboard();
    } catch (err: any) {
      showToast('Failed to add water.', 'error');
    }
  };

  if (isLoading || !data) {
    return <LoadingSpinner text="Synchronizing athlete telemetry..." size="lg" />;
  }

  const { metrics, currentGoal, activeSession, recentWorkouts, weeklyActivity, dailyQuote } = data;

  const caloriePercent = Math.min(
    100,
    Math.round((metrics.nutrition.calories.current / (metrics.nutrition.calories.target || 2200)) * 100)
  );

  const waterPercent = Math.min(
    100,
    Math.round((metrics.water.currentMl / (metrics.water.targetMl || 2500)) * 100)
  );

  const stepsPercent = Math.min(
    100,
    Math.round((metrics.steps.current / metrics.steps.target) * 100)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Active Workout In-Progress Alert Banner */}
      {activeSession && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-zinc-900 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-neon">
          <div className="flex items-center gap-3 text-left">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                ACTIVE WORKOUT IN PROGRESS
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white">
                {activeSession.title}
              </h4>
            </div>
          </div>
          <button
            onClick={() => onNavigate('active-session')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-neon"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Resume Workout</span>
          </button>
        </div>
      )}

      {/* Motivational Daily Quote Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900/80 via-[#11161D] to-zinc-900/80 border border-zinc-800/80 flex items-start gap-3">
        <Quote className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs sm:text-sm text-zinc-300 italic font-serif">
            "{dailyQuote.quote}"
          </p>
          <span className="text-[11px] font-semibold text-emerald-400 mt-1 block">
            — {dailyQuote.author}
          </span>
        </div>
      </div>

      {/* 4 Primary Top Telemetry Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Burned */}
        <div className="p-5 rounded-2xl bg-[#11161D] border border-zinc-800 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400">Calories Burned</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {metrics.caloriesBurned.today}
            </span>
            <span className="text-xs text-zinc-500">kcal</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Weekly: {metrics.caloriesBurned.weeklyTotal} kcal</span>
            <span className="text-emerald-400 font-semibold">+8%</span>
          </div>
        </div>

        {/* Steps */}
        <div className="p-5 rounded-2xl bg-[#11161D] border border-zinc-800 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400">Daily Steps</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Footprints className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {metrics.steps.current.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-500">/ 10k</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${stepsPercent}%` }}
            />
          </div>
        </div>

        {/* Workout Duration */}
        <div className="p-5 rounded-2xl bg-[#11161D] border border-zinc-800 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400">Active Time</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {metrics.workoutDurationMinutes.today}
            </span>
            <span className="text-xs text-zinc-500">mins today</span>
          </div>
          <div className="mt-3 text-[11px] text-zinc-400">
            Total this week: <span className="font-mono text-white">{metrics.workoutDurationMinutes.weeklyTotal}m</span>
          </div>
        </div>

        {/* Hydration */}
        <div className="p-5 rounded-2xl bg-[#11161D] border border-zinc-800 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400">Water Intake</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {metrics.water.currentMl}
              </span>
              <span className="text-xs text-zinc-500"> / {metrics.water.targetMl}ml</span>
            </div>
            <button
              onClick={handleQuickWaterAdd}
              className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-black transition"
              title="Add 250ml"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Charts & Goals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#11161D] border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Weekly Caloric & Training Output</h3>
              <p className="text-xs text-zinc-400">Calories burned per day over the past 7 days</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ACTIVE STREAK
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <XAxis
                  dataKey="day"
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{
                    backgroundColor: '#161D26',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
                  {weeklyActivity.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === weeklyActivity.length - 1 ? '#22c55e' : '#3f3f46'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Goal & Nutrition Macros (1 Col) */}
        <div className="space-y-6">
          {/* Active Goal Card */}
          <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Active Goal
              </span>
              <button
                onClick={() => onNavigate('progress')}
                className="text-xs text-zinc-400 hover:text-white"
              >
                All Goals →
              </button>
            </div>

            {currentGoal ? (
              <div>
                <h4 className="text-lg font-bold text-white">{currentGoal.title}</h4>
                <div className="flex items-baseline justify-between mt-3 text-xs text-zinc-400">
                  <span>Current: {currentGoal.currentValue} {currentGoal.unit}</span>
                  <span className="font-bold text-white">Target: {currentGoal.targetValue} {currentGoal.unit}</span>
                </div>
                <div className="mt-2 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300 shadow-neon"
                    style={{
                      width: `${Math.min(
                        100,
                        (currentGoal.currentValue / currentGoal.targetValue) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-zinc-400 mb-2">No active goal set yet.</p>
                <button
                  onClick={() => onNavigate('progress')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-emerald-400"
                >
                  + Set a Target
                </button>
              </div>
            )}
          </div>

          {/* Today's Nutrition Overview */}
          <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-zinc-300">Today's Nutrition</span>
              <button
                onClick={() => onNavigate('nutrition')}
                className="text-xs text-emerald-400 hover:underline"
              >
                Log Meal →
              </button>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold font-mono text-white">
                {metrics.nutrition.calories.current}
              </span>
              <span className="text-xs text-zinc-400">
                / {metrics.nutrition.calories.target} kcal ({caloriePercent}%)
              </span>
            </div>

            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-4">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>

            {/* Macros Distribution */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Protein</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {metrics.nutrition.proteinG}g
                </span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Carbs</span>
                <span className="font-bold text-cyan-400 font-mono">
                  {metrics.nutrition.carbsG}g
                </span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Fats</span>
                <span className="font-bold text-amber-400 font-mono">
                  {metrics.nutrition.fatG}g
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Workouts & AI Coach Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Workouts List (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#11161D] border border-zinc-800">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              Recent Completed Sessions
            </h3>
            <button
              onClick={() => onNavigate('workouts')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Browse Plans →
            </button>
          </div>

          <div className="space-y-3">
            {recentWorkouts.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No workouts completed yet. Launch your first session!
              </div>
            ) : (
              recentWorkouts.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-[#0B0F14] border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">{session.title}</h4>
                      <p className="text-xs text-zinc-400">
                        {new Date(session.completedAt || session.startedAt).toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        • {Math.round(session.durationSeconds / 60)} mins • {session.caloriesBurned} kcal
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-400 block">
                      {session.totalVolumeKg.toLocaleString()} kg
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase">Volume</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Launch & AI Assistant Card (1 Col) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/30 via-[#11161D] to-[#11161D] border border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-neon">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-display">
              AI Fitness Assistant
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Need to adjust your training split, evaluate lifting recovery, or calculate target macros for muscle growth? FitTrack AI provides immediate, science-based guidance.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onNavigate('ai-coach')}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-neon flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Consult AI Coach</span>
            </button>

            <button
              onClick={() => onStartWorkout()}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Open Workout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
