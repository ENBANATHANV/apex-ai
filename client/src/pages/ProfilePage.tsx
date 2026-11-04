import React, { useState } from 'react';
import { User, Mail, Calendar, Scale, Ruler, Target, Flame, Dumbbell, Save, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, profile, updateUserContext } = useAuth();
  const { showToast } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [age, setAge] = useState<number>(profile?.age || 26);
  const [height, setHeight] = useState<number>(profile?.height || 178);
  const [weight, setWeight] = useState<number>(profile?.weight || 75);
  const [targetWeight, setTargetWeight] = useState<number>(profile?.targetWeight || 78);
  const [primaryGoal, setPrimaryGoal] = useState(profile?.primaryGoal || 'Muscle Gain');
  const [fitnessLevel, setFitnessLevel] = useState(profile?.fitnessLevel || 'Intermediate');
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(profile?.dailyCalorieTarget || 2400);
  const [dailyWaterTargetMl, setDailyWaterTargetMl] = useState(profile?.dailyWaterTargetMl || 2800);
  const [isSaving, setIsSaving] = useState(false);

  // Derived Calculations
  const heightM = (height || 175) / 100;
  const bmi = Number(((weight || 70) / (heightM * heightM)).toFixed(1));
  // Mifflin-St Jeor formula for BMR (Male approximation)
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  const tdee = Math.round(bmr * 1.55); // moderate activity

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateProfile({
        fullName,
        bio,
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        targetWeight: Number(targetWeight),
        primaryGoal,
        fitnessLevel,
        dailyCalorieTarget: Number(dailyCalorieTarget),
        dailyWaterTargetMl: Number(dailyWaterTargetMl),
      });

      if (res.success && res.data) {
        updateUserContext(res.data);
        showToast('Athlete profile updated successfully!', 'success');
        setIsEditing(false);
      }
    } catch (err: any) {
      showToast('Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Profile Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#11161D] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-extrabold text-3xl shadow-neon">
            {fullName ? fullName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                {fullName || 'Athlete'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PRO ATHLETE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">{user?.email}</p>
            <p className="text-xs text-zinc-300 mt-2 max-w-md">
              {bio || 'Dedicated to functional power, hypertrophy, and optimal wellness.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${
            isEditing
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-neon'
          }`}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* Calculated Metabolic Telemetry Card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#11161D] border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Body Mass Index (BMI)</span>
          <span className="text-3xl font-extrabold font-mono text-cyan-400">{bmi}</span>
          <span className="text-[10px] text-zinc-500 block mt-1">Normal Weight: 18.5 – 24.9</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#11161D] border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Basal Metabolic Rate</span>
          <span className="text-3xl font-extrabold font-mono text-amber-400">{bmr}</span>
          <span className="text-[10px] text-zinc-500 block mt-1">kcal / day at complete rest</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#11161D] border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Estimated TDEE</span>
          <span className="text-3xl font-extrabold font-mono text-emerald-400">{tdee}</span>
          <span className="text-[10px] text-zinc-500 block mt-1">Daily expenditure with training</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#11161D] border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Target Caloric Goal</span>
          <span className="text-3xl font-extrabold font-mono text-white">
            {dailyCalorieTarget}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-1">Customized daily energy intake</span>
        </div>
      </div>

      {/* Profile Details & Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#11161D] border border-zinc-800">
        <h3 className="text-lg font-bold text-white mb-6 font-display">
          Athlete Telemetry & Preferences
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-750 text-white text-xs disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Age</label>
              <input
                type="number"
                disabled={!isEditing}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-750 text-white text-xs disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Height (cm)</label>
              <input
                type="number"
                disabled={!isEditing}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-750 text-white text-xs font-mono disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                disabled={!isEditing}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-750 text-white text-xs font-mono disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                disabled={!isEditing}
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-750 text-white text-xs font-mono disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Primary Goal</label>
              <select
                disabled={!isEditing}
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-750 text-white text-xs disabled:opacity-60"
              >
                <option value="Muscle Gain">Muscle Gain / Hypertrophy</option>
                <option value="Weight Loss">Fat Loss & Conditioning</option>
                <option value="Endurance">Endurance & Stamina</option>
                <option value="General Health">General Health & Longevity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Fitness Experience Level
              </label>
              <select
                disabled={!isEditing}
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-750 text-white text-xs disabled:opacity-60"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Bio</label>
            <textarea
              disabled={!isEditing}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-zinc-750 text-white text-xs disabled:opacity-60"
            />
          </div>

          {isEditing && (
            <button
              type="submit"
              disabled={isSaving}
              className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 shadow-neon transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Athlete Settings</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
