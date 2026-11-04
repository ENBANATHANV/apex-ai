import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Scale,
  Ruler,
  Target,
  Award,
  Plus,
  Camera,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { FitnessGoal, ProgressRecord } from '../types';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';

export const ProgressPage: React.FC = () => {
  const { showToast } = useNotification();
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Progress Log Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logWeight, setLogWeight] = useState('');
  const [logChest, setLogChest] = useState('');
  const [logWaist, setLogWaist] = useState('');
  const [logArms, setLogArms] = useState('');
  const [logPhotoUrl, setLogPhotoUrl] = useState('');
  const [logNotes, setLogNotes] = useState('');

  // New Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('Weight');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalUnit, setGoalUnit] = useState('kg');

  const fetchProgressData = async () => {
    try {
      const [analyticsRes, goalsRes, recordsRes] = await Promise.all([
        api.getProgressAnalytics(),
        api.getGoals(),
        api.getProgress(),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (goalsRes.success) setGoals(goalsRes.data);
      if (recordsRes.success) setRecords(recordsRes.data);
    } catch (err: any) {
      console.error('Failed to load progress data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const handleRecordProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logWeight) return;

    try {
      await api.logProgress({
        weightKg: Number(logWeight),
        chestCm: logChest ? Number(logChest) : undefined,
        waistCm: logWaist ? Number(logWaist) : undefined,
        armsCm: logArms ? Number(logArms) : undefined,
        photoUrl: logPhotoUrl || undefined,
        notes: logNotes || undefined,
      });

      showToast('Measurement logged successfully!', 'success');
      setIsLogModalOpen(false);
      setLogWeight('');
      setLogChest('');
      setLogWaist('');
      setLogArms('');
      setLogPhotoUrl('');
      setLogNotes('');
      fetchProgressData();
    } catch (err: any) {
      showToast('Failed to record progress.', 'error');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalTarget) return;

    try {
      await api.createGoal({
        title: goalTitle,
        category: goalCategory,
        targetValue: Number(goalTarget),
        unit: goalUnit,
      });

      showToast('Fitness goal established!', 'success');
      setIsGoalModalOpen(false);
      setGoalTitle('');
      setGoalTarget('');
      fetchProgressData();
    } catch (err: any) {
      showToast('Failed to establish goal.', 'error');
    }
  };

  if (isLoading || !analytics) {
    return <LoadingSpinner text="Analyzing physical trends & metrics..." size="lg" />;
  }

  const { stats, weightTimeline, milestones, profile } = analytics;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Progress & Analytics</h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Track body composition changes, volume growth over time, and unlocked fitness milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition border border-zinc-700"
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>New Goal</span>
          </button>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-neon transition"
          >
            <Scale className="w-4 h-4" />
            <span>Log Measurements</span>
          </button>
        </div>
      </div>

      {/* 4 Lifetime Performance Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#11161D] border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Total Workouts</span>
          <span className="text-3xl font-extrabold font-mono text-white">
            {stats.totalSessions}
          </span>
          <span className="text-[11px] text-zinc-500 block mt-2">
            Completed sessions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#11161D] border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Total Volume Moved</span>
          <span className="text-3xl font-extrabold font-mono text-amber-400">
            {stats.totalVolumeKg.toLocaleString()} <span className="text-xs">kg</span>
          </span>
          <span className="text-[11px] text-zinc-500 block mt-2">Cumulative tonnage</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#11161D] border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Active Streak</span>
          <span className="text-3xl font-extrabold font-mono text-emerald-400">
            {stats.currentStreakDays} <span className="text-xs">days</span>
          </span>
          <span className="text-[11px] text-zinc-500 block mt-2">Consistent momentum</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#11161D] border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Current BMI</span>
          <span className="text-3xl font-extrabold font-mono text-cyan-400">
            {((profile?.weight || 75) / (((profile?.height || 175) / 100) ** 2)).toFixed(1)}
          </span>
          <span className="text-[11px] text-zinc-500 block mt-2">Normal & healthy bracket</span>
        </div>
      </div>

      {/* Weight History Progression Chart */}
      <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Body Weight Progression
            </h3>
            <p className="text-xs text-zinc-400">Visual trend over logged weigh-ins</p>
          </div>
          <span className="text-xs font-mono font-bold text-white bg-zinc-800 px-3 py-1 rounded-xl">
            Current: {profile?.weight || 75} kg
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161D26',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="weightKg"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: '#22c55e', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goals & Milestones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fitness Goals */}
        <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Target Fitness Milestones
            </h3>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              + Add Goal
            </button>
          </div>

          <div className="space-y-3">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
              return (
                <div key={g.id} className="p-4 rounded-2xl bg-[#0B0F14] border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{g.title}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{pct}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span>Current: {g.currentValue} {g.unit}</span>
                    <span>Target: {g.targetValue} {g.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unlocked Badges & Milestones */}
        <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-400" />
            Achievements & Badges
          </h3>

          <div className="space-y-3">
            {milestones.map((m: any) => (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                  m.achieved
                    ? 'bg-amber-950/20 border-amber-500/40 text-white'
                    : 'bg-[#0B0F14] border-zinc-800/80 text-zinc-500 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                    m.achieved
                      ? 'bg-amber-500/20 text-amber-400 shadow-sm'
                      : 'bg-zinc-800 text-zinc-600'
                  }`}
                >
                  {m.achieved ? '🏆' : '🔒'}
                </div>
                <div>
                  <h4 className="text-xs font-bold">{m.title}</h4>
                  <p className="text-[11px] text-zinc-400">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Photos Gallery */}
      <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              Visual Transformation Gallery
            </h3>
            <p className="text-xs text-zinc-400">Chronological visual progression check-ins</p>
          </div>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
          >
            + Upload Photo
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="aspect-[3/4] rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center p-4 text-center">
            <Scale className="w-8 h-8 text-zinc-600 mb-2" />
            <span className="text-xs font-bold text-zinc-400">Week 1 Check-In</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-1">75.0 kg</span>
          </div>
          <div className="aspect-[3/4] rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center p-4 text-center">
            <Scale className="w-8 h-8 text-zinc-600 mb-2" />
            <span className="text-xs font-bold text-zinc-400">Week 2 Check-In</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-1">75.6 kg</span>
          </div>
          <div className="aspect-[3/4] rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center p-4 text-center">
            <Scale className="w-8 h-8 text-zinc-600 mb-2" />
            <span className="text-xs font-bold text-zinc-400">Week 3 Check-In</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-1">76.0 kg</span>
          </div>
          <div className="aspect-[3/4] rounded-2xl bg-emerald-950/20 border border-emerald-500/40 flex flex-col items-center justify-center p-4 text-center shadow-neon">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
            <span className="text-xs font-bold text-emerald-300">Latest Check-In</span>
            <span className="text-[10px] text-emerald-400 font-mono mt-1">
              {profile?.weight || 76.5} kg
            </span>
          </div>
        </div>
      </div>

      {/* Log Measurements Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Physical Measurements"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRecordProgress} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Body Weight (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              value={logWeight}
              onChange={(e) => setLogWeight(e.target.value)}
              placeholder="e.g. 76.5"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs font-mono focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-zinc-400">Chest (cm)</label>
              <input
                type="number"
                step="0.5"
                value={logChest}
                onChange={(e) => setLogChest(e.target.value)}
                placeholder="cm"
                className="w-full px-2 py-1.5 rounded-lg bg-[#0B0F14] border border-zinc-700 text-white text-xs text-center"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400">Waist (cm)</label>
              <input
                type="number"
                step="0.5"
                value={logWaist}
                onChange={(e) => setLogWaist(e.target.value)}
                placeholder="cm"
                className="w-full px-2 py-1.5 rounded-lg bg-[#0B0F14] border border-zinc-700 text-white text-xs text-center"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400">Arms (cm)</label>
              <input
                type="number"
                step="0.5"
                value={logArms}
                onChange={(e) => setLogArms(e.target.value)}
                placeholder="cm"
                className="w-full px-2 py-1.5 rounded-lg bg-[#0B0F14] border border-zinc-700 text-white text-xs text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Progress Photo URL (Optional)
            </label>
            <input
              type="url"
              value={logPhotoUrl}
              onChange={(e) => setLogPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Notes</label>
            <textarea
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="Felt energetic, improved shoulder definition..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-neon"
          >
            Save Progress Measurement
          </button>
        </form>
      </Modal>

      {/* New Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Establish Fitness Target"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateGoal} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Goal Objective Title
            </label>
            <input
              type="text"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Bench Press 100kg"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
              <select
                value={goalCategory}
                onChange={(e) => setGoalCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs"
              >
                <option value="Weight">Weight</option>
                <option value="Strength">Strength Power</option>
                <option value="Consistency">Consistency Streak</option>
                <option value="Endurance">Endurance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Target Value
              </label>
              <input
                type="number"
                step="0.5"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="100"
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-neon"
          >
            Create Goal
          </button>
        </form>
      </Modal>
    </div>
  );
};
