import React, { useState, useEffect } from 'react';
import { Search, Filter, Dumbbell, Info, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { api } from '../services/api';
import { Exercise } from '../types';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ExerciseLibraryPage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const fetchExercises = async () => {
    try {
      const res = await api.getExercises();
      if (res.success) {
        setExercises(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load exercises:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
  const equipmentTypes = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'];

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  if (isLoading) {
    return <LoadingSpinner text="Loading exercise movement database..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Exercise Library</h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Browse biomechanically sound exercises with execution cues, target muscle groups, and equipment tags.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#11161D] border border-zinc-800 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exercises by name, target muscle, or keyword..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700/80 text-white placeholder-zinc-500 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Muscle Filters */}
          <div className="flex flex-wrap gap-1.5">
            {muscleGroups.map((mg) => (
              <button
                key={mg}
                onClick={() => setSelectedMuscle(mg)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  selectedMuscle === mg
                    ? 'bg-emerald-500 text-black font-bold shadow-neon'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {mg}
              </button>
            ))}
          </div>

          {/* Equipment Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-zinc-500">Equipment:</span>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs focus:border-emerald-500"
            >
              {equipmentTypes.map((eq) => (
                <option key={eq} value={eq}>
                  {eq}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exercises List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => setSelectedExercise(exercise)}
            className="p-5 rounded-2xl bg-[#11161D] border border-zinc-800 hover:border-emerald-500/40 cursor-pointer transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {exercise.muscleGroup}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {exercise.difficulty}
                </span>
              </div>

              <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition mb-1">
                {exercise.name}
              </h4>

              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                {exercise.instructions}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 font-mono">
              <span>{exercise.equipment}</span>
              <span className="text-emerald-400 font-medium group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                Details →
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12 text-zinc-500 text-xs">
          No exercises found matching your filter criteria.
        </div>
      )}

      {/* Exercise Detail Modal */}
      <Modal
        isOpen={Boolean(selectedExercise)}
        onClose={() => setSelectedExercise(null)}
        title={selectedExercise?.name || 'Exercise Details'}
        maxWidth="max-w-xl"
      >
        {selectedExercise && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Primary: {selectedExercise.muscleGroup}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300">
                Equipment: {selectedExercise.equipment}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300">
                Level: {selectedExercise.difficulty}
              </span>
            </div>

            {selectedExercise.secondaryMuscles && (
              <div className="text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">Secondary Muscles: </span>
                <span>{selectedExercise.secondaryMuscles}</span>
              </div>
            )}

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Execution Steps
              </h5>
              <p className="text-xs text-zinc-300 leading-relaxed p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                {selectedExercise.instructions}
              </p>
            </div>

            {selectedExercise.tips && (
              <div>
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  Coach Performance Tips
                </h5>
                <p className="text-xs text-amber-200/90 leading-relaxed p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
                  {selectedExercise.tips}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
