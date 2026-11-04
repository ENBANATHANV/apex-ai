import React, { useState, useEffect } from 'react';
import {
  Play,
  Square,
  Plus,
  Clock,
  Dumbbell,
  Check,
  Flame,
  Award,
  Trash2,
  Bell,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { WorkoutSession, Exercise } from '../types';
import { RestTimer } from '../components/RestTimer';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';

interface ActiveWorkoutPageProps {
  onSessionFinished?: () => void;
  onNavigate: (page: string) => void;
}

export const ActiveWorkoutPage: React.FC<ActiveWorkoutPageProps> = ({
  onSessionFinished,
  onNavigate,
}) => {
  const { showToast } = useNotification();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [durationSeconds, setDurationSeconds] = useState(0);

  // Rest Timer modal/floating toggle
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [restSecondsPreset, setRestSecondsPreset] = useState(60);

  // Add Exercise to Session modal
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

  // Completion Summary Modal
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<any | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const fetchActiveSession = async () => {
    try {
      const res = await api.getActiveSession();
      if (res.success && res.data) {
        setSession(res.data);
        // compute elapsed seconds from startedAt
        const elapsed = Math.floor(
          (Date.now() - new Date(res.data.startedAt).getTime()) / 1000
        );
        setDurationSeconds(Math.max(0, elapsed));
      } else {
        setSession(null);
      }
    } catch (err: any) {
      console.error('Failed to load active workout session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSession();
  }, []);

  // Duration Timer Interval
  useEffect(() => {
    let timer: any = null;
    if (session && session.status === 'in_progress') {
      timer = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [session]);

  const handleStartQuickSession = async () => {
    try {
      setIsLoading(true);
      const res = await api.startSession(undefined, undefined, 'Open Training Session');
      if (res.success && res.data) {
        setSession(res.data);
        setDurationSeconds(0);
        showToast('Workout session started! Let’s crush it.', 'success');
      }
    } catch (err: any) {
      showToast('Failed to start session.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSetComplete = async (
    setId: string,
    currentCompleted: boolean,
    weightKg: number,
    reps: number
  ) => {
    try {
      const nextCompleted = !currentCompleted;
      await api.updateSet(setId, {
        completed: nextCompleted,
        weightKg,
        actualReps: reps,
      });

      // Update local state smoothly
      if (session && session.sessionExercises) {
        const updated = {
          ...session,
          sessionExercises: session.sessionExercises.map((se) => ({
            ...se,
            sets: se.sets.map((s) => (s.id === setId ? { ...s, completed: nextCompleted } : s)),
          })),
        };
        setSession(updated);
      }

      if (nextCompleted) {
        // Automatically launch rest timer
        setIsRestTimerOpen(true);
      }
    } catch (err: any) {
      showToast('Failed to update set.', 'error');
    }
  };

  const handleUpdateSetWeight = (setId: string, val: number) => {
    if (!session || !session.sessionExercises) return;
    setSession({
      ...session,
      sessionExercises: session.sessionExercises.map((se) => ({
        ...se,
        sets: se.sets.map((s) => (s.id === setId ? { ...s, weightKg: val } : s)),
      })),
    });
  };

  const handleUpdateSetReps = (setId: string, val: number) => {
    if (!session || !session.sessionExercises) return;
    setSession({
      ...session,
      sessionExercises: session.sessionExercises.map((se) => ({
        ...se,
        sets: se.sets.map((s) => (s.id === setId ? { ...s, actualReps: val } : s)),
      })),
    });
  };

  const handleAddSet = async (workoutExerciseId: string) => {
    try {
      const res = await api.addSetToExercise(workoutExerciseId);
      if (res.success && res.data) {
        fetchActiveSession();
      }
    } catch (err: any) {
      showToast('Failed to add set.', 'error');
    }
  };

  const handleOpenAddExercise = async () => {
    try {
      const res = await api.getExercises();
      if (res.success) {
        setAvailableExercises(res.data);
        setIsAddExerciseOpen(true);
      }
    } catch (err: any) {
      showToast('Failed to load exercise list.', 'error');
    }
  };

  const handleSelectExercise = async (exerciseId: string) => {
    if (!session) return;
    try {
      await api.addExerciseToSession(session.id, exerciseId);
      setIsAddExerciseOpen(false);
      showToast('Exercise added to current workout!', 'success');
      fetchActiveSession();
    } catch (err: any) {
      showToast('Failed to add exercise.', 'error');
    }
  };

  const handleFinishWorkout = async () => {
    if (!session) return;
    try {
      const res = await api.completeSession(session.id, {
        notes: sessionNotes,
        durationSeconds,
      });

      if (res.success && res.data) {
        setCompletedSummary(res.data);
        setIsCompletionModalOpen(true);

        // Confetti explosion celebratory effect!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#00FF87', '#10B981', '#38bdf8', '#fbbf24'],
        });

        showToast('Workout successfully saved and recorded! 🏆', 'success');
      }
    } catch (err: any) {
      showToast('Failed to complete workout session.', 'error');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Connecting to active workout session..." size="lg" />;
  }

  // If no session is active, show the launcher screen
  if (!session) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-neon">
          <Dumbbell className="w-8 h-8 transform -rotate-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-white font-display mb-2">
          No Active Workout Session
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
          Ready to train? Start an open logging session or launch one of your structured workout programs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleStartQuickSession}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-neon"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Start Empty Workout</span>
          </button>
          <button
            onClick={() => onNavigate('workouts')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm transition"
          >
            Browse Workout Plans
          </button>
        </div>
      </div>
    );
  }

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  // Calculate live volume lifted
  let liveVolume = 0;
  let completedSets = 0;
  let totalSets = 0;

  session.sessionExercises?.forEach((se) => {
    se.sets.forEach((s) => {
      totalSets++;
      if (s.completed) {
        completedSets++;
        liveVolume += (s.weightKg || 0) * (s.actualReps || 0);
      }
    });
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Session Header Card with Live Stopwatch & Actions */}
      <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-20 z-30 shadow-2xl backdrop-blur-md bg-opacity-95">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-neon" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              RECORDING LIVE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            {session.title}
          </h2>
        </div>

        {/* Real-time Telemetry Bar */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase block font-semibold">
              Elapsed Time
            </span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-white">
              {hours > 0 ? `${hours}:` : ''}
              {minutes < 10 ? `0${minutes}` : minutes}:
              {seconds < 10 ? `0${seconds}` : seconds}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase block font-semibold">
              Volume Lifted
            </span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
              {liveVolume.toLocaleString()} <span className="text-xs">kg</span>
            </span>
          </div>

          <button
            onClick={() => setIsRestTimerOpen(!isRestTimerOpen)}
            className={`p-2.5 rounded-xl border transition ${
              isRestTimerOpen
                ? 'bg-emerald-500 text-black border-emerald-500'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
            title="Interval Rest Timer"
          >
            <Bell className="w-5 h-5" />
          </button>

          <button
            onClick={handleFinishWorkout}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-neon-strong"
          >
            <Square className="w-3.5 h-3.5 fill-black" />
            <span>Finish Workout</span>
          </button>
        </div>
      </div>

      {/* Floating Rest Timer Window (can be toggled or floats at bottom right) */}
      {isRestTimerOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-6 duration-200">
          <RestTimer
            initialSeconds={restSecondsPreset}
            onClose={() => setIsRestTimerOpen(false)}
            autoStart={true}
          />
        </div>
      )}

      {/* Exercises & Set Tracking Table */}
      <div className="space-y-6">
        {session.sessionExercises && session.sessionExercises.length > 0 ? (
          session.sessionExercises.map((se, exIdx) => (
            <div
              key={se.id}
              className="p-5 sm:p-6 rounded-3xl bg-[#11161D] border border-zinc-800"
            >
              {/* Exercise Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-zinc-800 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                    {exIdx + 1}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {se.exercise.name}
                    </h3>
                    <span className="text-[11px] text-zinc-400">
                      {se.exercise.muscleGroup} • {se.exercise.equipment}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddSet(se.id)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-750 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Set</span>
                </button>
              </div>

              {/* Sets Table */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3">
                  <span className="col-span-2">Set</span>
                  <span className="col-span-4">Weight (kg)</span>
                  <span className="col-span-4">Reps</span>
                  <span className="col-span-2 text-right">Done</span>
                </div>

                {se.sets.map((set) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-2 items-center p-3 rounded-2xl border transition ${
                      set.completed
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-[#0B0F14] border-zinc-800 text-zinc-200'
                    }`}
                  >
                    <div className="col-span-2 font-mono font-bold text-xs text-zinc-400">
                      #{set.setNumber}
                    </div>

                    <div className="col-span-4">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={set.weightKg ?? 0}
                        onChange={(e) =>
                          handleUpdateSetWeight(set.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:border-emerald-500 text-center"
                      />
                    </div>

                    <div className="col-span-4">
                      <input
                        type="number"
                        min="0"
                        value={set.actualReps ?? 10}
                        onChange={(e) =>
                          handleUpdateSetReps(set.id, parseInt(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:border-emerald-500 text-center"
                      />
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() =>
                          handleToggleSetComplete(
                            set.id,
                            set.completed,
                            set.weightKg || 0,
                            set.actualReps || 10
                          )
                        }
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition shadow-sm ${
                          set.completed
                            ? 'bg-emerald-500 text-black shadow-neon'
                            : 'bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 rounded-3xl bg-[#11161D] border border-zinc-800 text-center space-y-3">
            <p className="text-xs sm:text-sm text-zinc-400">
              No exercises added yet to this workout session.
            </p>
            <button
              onClick={handleOpenAddExercise}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs inline-flex items-center gap-2 shadow-neon transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Exercise</span>
            </button>
          </div>
        )}

        {/* Add Exercise Button */}
        {session.sessionExercises && session.sessionExercises.length > 0 && (
          <button
            onClick={handleOpenAddExercise}
            className="w-full py-4 rounded-3xl border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Exercise to Session</span>
          </button>
        )}
      </div>

      {/* Exercise Picker Modal */}
      <Modal
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        title="Add Exercise to Active Session"
        maxWidth="max-w-md"
      >
        <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800">
          {availableExercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => handleSelectExercise(ex.id)}
              className="p-3 hover:bg-zinc-800/60 cursor-pointer rounded-xl flex items-center justify-between transition"
            >
              <div>
                <p className="text-xs font-bold text-white">{ex.name}</p>
                <p className="text-[10px] text-zinc-400">
                  {ex.muscleGroup} • {ex.equipment}
                </p>
              </div>
              <Plus className="w-4 h-4 text-emerald-400" />
            </div>
          ))}
        </div>
      </Modal>

      {/* Completion Summary Celebration Modal */}
      <Modal
        isOpen={isCompletionModalOpen}
        onClose={() => {
          setIsCompletionModalOpen(false);
          setSession(null);
          if (onSessionFinished) onSessionFinished();
          onNavigate('dashboard');
        }}
        title="Workout Complete! 🏆"
        maxWidth="max-w-md"
      >
        {completedSummary && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-neon">
              <Award className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white font-display">
              Outstanding Performance!
            </h3>
            <p className="text-xs text-zinc-400">
              Your session metrics have been permanently logged to your progress history.
            </p>

            <div className="grid grid-cols-3 gap-2 text-center py-2">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block font-semibold">
                  Duration
                </span>
                <span className="text-base font-bold font-mono text-white">
                  {Math.round(completedSummary.durationSeconds / 60)} mins
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block font-semibold">
                  Calories
                </span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {completedSummary.caloriesBurned} kcal
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block font-semibold">
                  Volume
                </span>
                <span className="text-base font-bold font-mono text-amber-400">
                  {completedSummary.totalVolumeKg.toLocaleString()} kg
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCompletionModalOpen(false);
                setSession(null);
                if (onSessionFinished) onSessionFinished();
                onNavigate('dashboard');
              }}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-neon"
            >
              Return to Performance Dashboard
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
