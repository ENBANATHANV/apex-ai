import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Sparkles,
  Plus,
  Play,
  Calendar,
  Layers,
  ChevronRight,
  Trash2,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { WorkoutPlan } from '../types';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

interface WorkoutsPageProps {
  onStartWorkout: (planId: string, dayNumber?: number) => void;
  onNavigate: (page: string) => void;
}

export const WorkoutsPage: React.FC<WorkoutsPageProps> = ({
  onStartWorkout,
  onNavigate,
}) => {
  const { profile } = useAuth();
  const { showToast } = useNotification();

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // AI Plan Generator Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiFocus, setAiFocus] = useState('Hypertrophy');
  const [aiDays, setAiDays] = useState(4);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedAiPlan, setGeneratedAiPlan] = useState<any | null>(null);

  // Custom Plan Creator Modal
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('Strength');
  const [customDifficulty, setCustomDifficulty] = useState('Intermediate');
  const [customDays, setCustomDays] = useState(4);
  const [customDesc, setCustomDesc] = useState('');

  const fetchPlans = async () => {
    try {
      const res = await api.getWorkouts();
      if (res.success) {
        setPlans(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load workouts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleGenerateAiPlan = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await api.generateAiWorkoutPlan({
        focus: aiFocus,
        daysPerWeek: aiDays,
        prompt: aiPrompt,
      });

      if (res.success && res.data) {
        setGeneratedAiPlan(res.data);
        showToast('AI training plan formulated!', 'success');
      }
    } catch (err: any) {
      showToast('AI Plan generation failed: ' + err.message, 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveAiPlan = async () => {
    if (!generatedAiPlan) return;
    try {
      // Flatten exercises from AI plan days
      const flatExercises: any[] = [];
      generatedAiPlan.days.forEach((day: any) => {
        day.exercises.forEach((ex: any, idx: number) => {
          flatExercises.push({
            name: ex.name,
            dayOfWeek: day.dayNumber,
            order: idx + 1,
            targetSets: ex.sets || 3,
            targetReps: String(ex.reps || '8-12'),
            restSeconds: ex.restSeconds || 60,
            notes: ex.notes,
          });
        });
      });

      await api.createWorkout({
        title: generatedAiPlan.title,
        description: generatedAiPlan.description,
        category: generatedAiPlan.category,
        difficulty: generatedAiPlan.difficulty,
        daysPerWeek: generatedAiPlan.daysPerWeek,
        isAiGenerated: true,
        exercises: flatExercises,
      });

      showToast('AI Workout Plan added to your library! 🚀', 'success');
      setIsAiModalOpen(false);
      setGeneratedAiPlan(null);
      fetchPlans();
    } catch (err: any) {
      showToast('Failed to save AI plan.', 'error');
    }
  };

  const handleCreateCustomPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle) return;

    try {
      await api.createWorkout({
        title: customTitle,
        description: customDesc || 'Custom routine.',
        category: customCategory,
        difficulty: customDifficulty,
        daysPerWeek: Number(customDays),
      });

      showToast('Workout plan created!', 'success');
      setIsCustomModalOpen(false);
      setCustomTitle('');
      setCustomDesc('');
      fetchPlans();
    } catch (err: any) {
      showToast('Failed to create plan.', 'error');
    }
  };

  const handleDeletePlan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workout plan?')) return;
    try {
      await api.deleteWorkout(id);
      showToast('Plan deleted.', 'info');
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      showToast('Failed to delete plan.', 'error');
    }
  };

  const filteredPlans = filterCategory === 'All'
    ? plans
    : plans.filter((p) => p.category.toLowerCase() === filterCategory.toLowerCase());

  if (isLoading) {
    return <LoadingSpinner text="Loading workout plans..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Workout Programs</h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Browse structured multi-week training splits, custom routines, and AI programs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold text-xs flex items-center gap-2 shadow-neon transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate with AI</span>
          </button>

          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition border border-zinc-700"
          >
            <Plus className="w-4 h-4" />
            <span>Custom Plan</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Strength', 'Hypertrophy', 'Fat Loss', 'Endurance'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
              filterCategory === cat
                ? 'bg-emerald-500 text-black font-bold shadow-neon'
                : 'bg-[#11161D] border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Workout Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => {
          const exerciseCount = plan.exercises ? plan.exercises.length : 0;
          return (
            <div
              key={plan.id}
              className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between group relative overflow-hidden"
            >
              {plan.isAiGenerated && (
                <div className="absolute top-0 right-0 bg-emerald-500/20 border-b border-l border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI GENERATED</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-800 text-emerald-400 border border-zinc-700">
                    {plan.category}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {plan.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition">
                  {plan.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                  {plan.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 mb-6 font-mono">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{plan.daysPerWeek} days / week</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{exerciseCount > 0 ? `${exerciseCount} exercises` : 'Structured'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-zinc-800/80">
                <button
                  onClick={() => onStartWorkout(plan.id, 1)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-neon"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Start Workout</span>
                </button>

                {plan.isCustom && (
                  <button
                    onClick={(e) => handleDeletePlan(plan.id, e)}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 transition"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Workout Plan Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setGeneratedAiPlan(null);
        }}
        title="AI Workout Program Architect"
        maxWidth="max-w-2xl"
      >
        <MedicalDisclaimer compact />

        {!generatedAiPlan ? (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400">
              Our AI sports scientist tailors a periodized workout split using your biometrics and strength objectives.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Training Focus
                </label>
                <select
                  value={aiFocus}
                  onChange={(e) => setAiFocus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs focus:border-emerald-500"
                >
                  <option value="Hypertrophy">Hypertrophy (Muscle Size)</option>
                  <option value="Strength">Maximum Strength Power</option>
                  <option value="Fat Loss">Metabolic Conditioning / Fat Loss</option>
                  <option value="Endurance">Cardiovascular & Muscular Endurance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Frequency
                </label>
                <select
                  value={aiDays}
                  onChange={(e) => setAiDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs focus:border-emerald-500"
                >
                  <option value={3}>3 Days (Full Body)</option>
                  <option value={4}>4 Days (Upper / Lower)</option>
                  <option value={5}>5 Days (Push / Pull / Legs)</option>
                  <option value={6}>6 Days (PPL Split)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Custom Instructions or Constraints (Optional)
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Focus on chest development, avoid squats due to knee strain, emphasize dumbbell work."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white placeholder-zinc-500 text-xs focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleGenerateAiPlan}
              disabled={isGeneratingAi}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-neon disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Periodized Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Personalized Training Split</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Render Generated AI Plan Review */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                AI DESIGNED PROGRAM
              </span>
              <h4 className="text-lg font-bold text-white">{generatedAiPlan.title}</h4>
              <p className="text-xs text-zinc-300 mt-1">{generatedAiPlan.description}</p>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {generatedAiPlan.days?.map((d: any) => (
                <div key={d.dayNumber} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400">
                      Day {d.dayNumber}: {d.dayTitle}
                    </span>
                    <span className="text-[10px] text-zinc-400">{d.focus}</span>
                  </div>
                  <ul className="text-xs text-zinc-300 space-y-1">
                    {d.exercises?.map((ex: any, i: number) => (
                      <li key={i} className="flex items-center justify-between text-zinc-400">
                        <span className="text-zinc-200 font-medium">• {ex.name}</span>
                        <span className="font-mono text-[11px] text-emerald-400">
                          {ex.sets} sets × {ex.reps}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {generatedAiPlan.recoveryTips && (
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-200 block mb-1">Recovery Protocols:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {generatedAiPlan.recoveryTips.map((tip: string, idx: number) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setGeneratedAiPlan(null)}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Regenerate
              </button>
              <button
                onClick={handleSaveAiPlan}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-neon"
              >
                Save to My Workout Plans
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Custom Plan Creator Modal */}
      <Modal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        title="Create Custom Workout Program"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateCustomPlan} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Program Title
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. 4-Day Strength & Conditioning"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs"
              >
                <option value="Strength">Strength</option>
                <option value="Hypertrophy">Hypertrophy</option>
                <option value="Fat Loss">Fat Loss</option>
                <option value="Endurance">Endurance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Days / Week</label>
              <input
                type="number"
                min="1"
                max="7"
                value={customDays}
                onChange={(e) => setCustomDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder="Brief details about this program..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-neon"
          >
            Create Program
          </button>
        </form>
      </Modal>
    </div>
  );
};
