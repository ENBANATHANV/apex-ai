import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Dumbbell,
  Target,
  Calendar,
  Utensils,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

interface OnboardingPageProps {
  onNavigate: (page: string) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onNavigate }) => {
  const { updateUserContext, refreshUser } = useAuth();
  const { showToast } = useNotification();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<string>('male');
  const [height, setHeight] = useState<number>(178); // cm
  const [weight, setWeight] = useState<number>(75); // kg
  const [targetWeight, setTargetWeight] = useState<number>(78); // kg

  const [fitnessLevel, setFitnessLevel] = useState<string>('Intermediate');
  const [primaryGoal, setPrimaryGoal] = useState<string>('Muscle Gain');

  const [workoutDaysPerWeek, setWorkoutDaysPerWeek] = useState<number>(4);
  const [equipment, setEquipment] = useState<string>('Full Gym');
  const [preferredWorkouts, setPreferredWorkouts] = useState<string[]>([
    'Gym',
    'Bodyweight',
    'HIIT',
  ]);

  const [dietaryPreference, setDietaryPreference] = useState<string>('High Protein');

  const toggleWorkoutType = (type: string) => {
    if (preferredWorkouts.includes(type)) {
      setPreferredWorkouts(preferredWorkouts.filter((t) => t !== type));
    } else {
      setPreferredWorkouts([...preferredWorkouts, type]);
    }
  };

  const calculateTargetCalories = () => {
    let multiplier = 30;
    if (primaryGoal === 'Weight Loss') multiplier = 26;
    if (primaryGoal === 'Muscle Gain') multiplier = 35;
    return Math.round(weight * multiplier);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const res = await api.completeOnboarding({
        age,
        gender,
        height,
        weight,
        targetWeight,
        fitnessLevel,
        primaryGoal,
        preferredWorkouts,
        workoutDaysPerWeek,
        equipment,
        dietaryPreference,
      });

      if (res.success && res.data) {
        updateUserContext(res.data);
        await refreshUser();
        showToast('Onboarding completed! Your customized dashboard is ready.', 'success');
        onNavigate('dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save onboarding settings.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0E] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2">
            <span className="text-emerald-400 font-mono">STEP {step} OF 4</span>
            <span>
              {step === 1
                ? 'Biometrics'
                : step === 2
                ? 'Fitness Goals'
                : step === 3
                ? 'Training Schedule'
                : 'Nutrition Architecture'}
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300 shadow-neon"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-[#11161D] border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {/* Step 1: Biometrics */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white font-display">Your Physical Baseline</h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  We use your biometrics to calibrate accurate energy expenditure (TDEE), BMI, and load progression.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Age</label>
                  <input
                    type="number"
                    min="14"
                    max="90"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white font-mono text-sm focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-sm focus:border-emerald-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white font-mono text-sm focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white font-mono text-sm focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white font-mono text-sm focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                <span>Calculated Baseline BMI:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {((weight / (height / 100) ** 2)).toFixed(1)} kg/m²
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Goal & Fitness Level */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white font-display">Goals & Training Experience</h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  FitTrack AI adapts exercise selection and volume loads based on your mastery level.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Primary Fitness Goal
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Muscle Gain', label: 'Hypertrophy / Muscle Gain', desc: 'Build lean contractile tissue' },
                    { id: 'Weight Loss', label: 'Fat Loss & Shred', desc: 'Accelerate caloric deficit' },
                    { id: 'Endurance', label: 'Endurance & Stamina', desc: 'Conditioning and cardio capacity' },
                    { id: 'General Health', label: 'Functional Longevity', desc: 'Mobility, strength & wellbeing' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setPrimaryGoal(g.id)}
                      className={`p-3.5 rounded-2xl border text-left transition ${
                        primaryGoal === g.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-neon'
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-bold text-white">{g.label}</p>
                      <p className="text-[11px] text-zinc-400 mt-1">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Current Fitness Experience
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Beginner', title: 'Beginner', sub: '< 1 year' },
                    { id: 'Intermediate', title: 'Intermediate', sub: '1 - 3 years' },
                    { id: 'Advanced', title: 'Advanced', sub: '3+ years' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setFitnessLevel(lvl.id)}
                      className={`p-3 rounded-2xl border text-center transition ${
                        fitnessLevel === lvl.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-neon'
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-bold text-white">{lvl.title}</p>
                      <p className="text-[10px] text-zinc-400">{lvl.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Equipment & Schedule */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white font-display">Schedule & Equipment</h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  How many days can you consistently dedicate to working out each week?
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    Training Days per Week
                  </label>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {workoutDaysPerWeek} Days / Week
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={workoutDaysPerWeek}
                  onChange={(e) => setWorkoutDaysPerWeek(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>2 Days (Express)</span>
                  <span>4 Days (Optimal)</span>
                  <span>6 Days (Athletic)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Equipment Access
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Full Commercial Gym',
                    'Dumbbells & Bench',
                    'Home Gym / Barbell',
                    'Bodyweight Only',
                  ].map((eq) => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => setEquipment(eq)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition ${
                        equipment === eq
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Preferred Training Styles (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Gym', 'Bodyweight', 'HIIT', 'Powerlifting', 'Cardio', 'Mobility'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleWorkoutType(style)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        preferredWorkouts.includes(style)
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Dietary Preferences & Target Preview */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white font-display">Nutrition Roadmap</h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Tailored nutritional blueprints for energy, recovery, and body composition.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Dietary Pattern
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    'High Protein',
                    'Standard Balanced',
                    'Vegetarian',
                    'Vegan',
                    'Keto / Low Carb',
                    'Paleo',
                  ].map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => setDietaryPreference(diet)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-medium transition ${
                        dietaryPreference === diet
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Calibrated Targets Card */}
              <div className="p-4 rounded-2xl bg-[#0B0F14] border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-3 text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Calculated Daily Targets
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Daily Energy</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-white">
                      {calculateTargetCalories()} kcal
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Daily Protein</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                      {Math.round(weight * 2.0)}g
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Hydration</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-cyan-400">
                      {Math.round(weight * 35)} ml
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Controls */}
          <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition shadow-neon"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition shadow-neon-strong disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Launch My FitTrack</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
