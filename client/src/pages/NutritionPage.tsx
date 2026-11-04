import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Droplet,
  Trash2,
  Search,
  Sparkles,
  PieChart as PieIcon,
  Flame,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import { Meal, FoodItem } from '../types';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const NutritionPage: React.FC = () => {
  const { showToast } = useNotification();
  const [dailyData, setDailyData] = useState<any | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Food Logging Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('BREAKFAST');
  const [searchQuery, setSearchQuery] = useState('');
  const [foodDbResults, setFoodDbResults] = useState<any[]>([]);

  // Custom Food Entry
  const [customFoodName, setCustomFoodName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  // AI Advice Modal
  const [isAiAdviceOpen, setIsAiAdviceOpen] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<any | null>(null);
  const [isFetchingAi, setIsFetchingAi] = useState(false);

  const fetchNutrition = async () => {
    try {
      const [dailyRes, weeklyRes] = await Promise.all([
        api.getDailyNutrition(),
        api.getWeeklyNutrition(),
      ]);
      if (dailyRes.success) setDailyData(dailyRes.data);
      if (weeklyRes.success) setWeeklyData(weeklyRes.data);
    } catch (err: any) {
      console.error('Failed to load nutrition:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, []);

  const handleSearchFood = async (q: string) => {
    setSearchQuery(q);
    try {
      const res = await api.getFoodDatabase(q);
      if (res.success) setFoodDbResults(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFoodFromDb = async (food: any) => {
    try {
      await api.logMeal({
        mealType: selectedMealType,
        foodItems: [food],
      });
      showToast(`Added ${food.name} to ${selectedMealType.toLowerCase()}!`, 'success');
      setIsLogModalOpen(false);
      fetchNutrition();
    } catch (err: any) {
      showToast('Failed to log food item.', 'error');
    }
  };

  const handleAddCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodName || !customCalories) return;

    try {
      await api.logMeal({
        mealType: selectedMealType,
        foodItems: [
          {
            name: customFoodName,
            servingSize: '1 serving',
            calories: Number(customCalories) || 0,
            proteinG: Number(customProtein) || 0,
            carbsG: Number(customCarbs) || 0,
            fatG: Number(customFat) || 0,
          },
        ],
      });

      showToast(`Logged ${customFoodName}!`, 'success');
      setIsLogModalOpen(false);
      setCustomFoodName('');
      setCustomCalories('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
      fetchNutrition();
    } catch (err: any) {
      showToast('Failed to add custom food.', 'error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await api.deleteMealItem(id);
      showToast('Item removed.', 'info');
      fetchNutrition();
    } catch (err: any) {
      showToast('Failed to delete item.', 'error');
    }
  };

  const handleAddWater = async (amount: number) => {
    try {
      await api.logWater(amount);
      showToast(`Added ${amount}ml of water! 💧`, 'success');
      fetchNutrition();
    } catch (err: any) {
      showToast('Failed to add water.', 'error');
    }
  };

  const handleFetchAiAdvice = async () => {
    setIsAiAdviceOpen(true);
    setIsFetchingAi(true);
    try {
      const res = await api.getAiNutritionAdvice(dailyData?.targets?.calories);
      if (res.success) {
        setAiAdvice(res.data);
      }
    } catch (err: any) {
      showToast('Failed to generate AI advice.', 'error');
    } finally {
      setIsFetchingAi(false);
    }
  };

  if (isLoading || !dailyData) {
    return <LoadingSpinner text="Computing metabolic logs & macros..." size="lg" />;
  }

  const { targets, totals, meals } = dailyData;

  const macroPieData = [
    { name: 'Protein', value: totals.proteinG * 4, color: '#22c55e' },
    { name: 'Carbs', value: totals.carbsG * 4, color: '#06b6d4' },
    { name: 'Fats', value: totals.fatG * 9, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Nutrition & Macros</h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Precision daily calorie tracking, macro ratio distribution, and hydration logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFetchAiAdvice}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold text-xs flex items-center gap-2 shadow-neon transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Nutrition Coach</span>
          </button>

          <button
            onClick={() => {
              setSelectedMealType('BREAKFAST');
              handleSearchFood('');
              setIsLogModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition border border-zinc-700"
          >
            <Plus className="w-4 h-4" />
            <span>Log Food Item</span>
          </button>
        </div>
      </div>

      {/* Main Macro Balance Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Daily Energy Target</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-white">
              {totals.calories}
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ {targets.calories} kcal</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300 shadow-neon"
              style={{ width: `${Math.min(100, (totals.calories / targets.calories) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 block">
            {Math.max(0, targets.calories - totals.calories)} kcal remaining today
          </span>
        </div>

        {/* Protein */}
        <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800">
          <span className="text-xs font-semibold text-emerald-400 block mb-1">Protein (4 kcal/g)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {totals.proteinG}g
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ {targets.proteinG}g</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full"
              style={{ width: `${Math.min(100, (totals.proteinG / targets.proteinG) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 block">
            Crucial for muscle protein synthesis
          </span>
        </div>

        {/* Carbs */}
        <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800">
          <span className="text-xs font-semibold text-cyan-400 block mb-1">Carbs (4 kcal/g)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-cyan-400">
              {totals.carbsG}g
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ {targets.carbsG}g</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full"
              style={{ width: `${Math.min(100, (totals.carbsG / targets.carbsG) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 block">
            Primary glycolytic energy driver
          </span>
        </div>

        {/* Fats */}
        <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800">
          <span className="text-xs font-semibold text-amber-400 block mb-1">Fats (9 kcal/g)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-amber-400">
              {totals.fatG}g
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ {targets.fatG}g</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full"
              style={{ width: `${Math.min(100, (totals.fatG / targets.fatG) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 block">
            Hormonal & cellular membrane support
          </span>
        </div>
      </div>

      {/* Water Intake Interactive Station & Weekly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hydration Station (1 Col) */}
        <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Droplet className="w-4 h-4" />
                Intracellular Hydration
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {Math.round((totals.waterMl / targets.waterMl) * 100)}%
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold font-mono text-white">
                {totals.waterMl}
              </span>
              <span className="text-xs text-zinc-400">/ {targets.waterMl} ml</span>
            </div>

            {/* Visual Glass Water Level */}
            <div className="w-full bg-zinc-900 border border-zinc-800 h-6 rounded-xl overflow-hidden p-0.5 mb-6">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-lg transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(100, (totals.waterMl / targets.waterMl) * 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[250, 500, 750].map((amt) => (
              <button
                key={amt}
                onClick={() => handleAddWater(amt)}
                className="py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold transition"
              >
                +{amt}ml
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Calories Analytics (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#11161D] border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Weekly Caloric Intake Trend</h3>
              <p className="text-xs text-zinc-400">Track day-to-day energy intake against your baseline</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Target: {targets.calories} kcal
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
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
                <Bar dataKey="calories" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Meals Breakdown by Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white font-display">Daily Meal Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealTypes.map((type) => {
            const meal = meals.find((m: Meal) => m.mealType === type);
            const items: FoodItem[] = meal ? meal.foodItems : [];
            const mealCalories = items.reduce((acc, f) => acc + f.calories, 0);

            return (
              <div
                key={type}
                className="p-5 rounded-3xl bg-[#11161D] border border-zinc-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </h4>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {mealCalories} kcal
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedMealType(type);
                        handleSearchFood('');
                        setIsLogModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-emerald-400 flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-3 text-center">
                        No food items logged for this meal yet.
                      </p>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="text-zinc-200 font-medium">{item.name}</span>
                            <span className="text-[11px] text-zinc-500 block">
                              {item.servingSize} • P: {item.proteinG}g | C: {item.carbsG}g | F: {item.fatG}g
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-400 font-bold">
                              {item.calories} kcal
                            </span>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-zinc-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Food Item Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title={`Log Food to ${selectedMealType}`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          {/* Search Curated Database */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchFood(e.target.value)}
              placeholder="Search food database (e.g. Chicken breast, Salmon, Oats, Eggs)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs focus:border-emerald-500"
            />
          </div>

          {/* Quick Selection List from DB */}
          <div className="max-h-56 overflow-y-auto divide-y divide-zinc-800">
            {foodDbResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleAddFoodFromDb(item)}
                className="p-2.5 hover:bg-zinc-800/60 cursor-pointer rounded-xl flex items-center justify-between transition text-xs"
              >
                <div>
                  <p className="font-bold text-zinc-200">{item.name}</p>
                  <p className="text-[10px] text-zinc-400">
                    {item.servingSize} • P: {item.proteinG}g | C: {item.carbsG}g | F: {item.fatG}g
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400">{item.calories} kcal</span>
                  <Plus className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Or Custom Quick Entry */}
          <div className="pt-4 border-t border-zinc-800">
            <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Or Custom Food Entry
            </h5>
            <form onSubmit={handleAddCustomFood} className="space-y-3">
              <input
                type="text"
                value={customFoodName}
                onChange={(e) => setCustomFoodName(e.target.value)}
                placeholder="Food item name..."
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs focus:border-emerald-500"
              />

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400">Calories</label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    placeholder="kcal"
                    required
                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0F14] border border-zinc-700 text-white text-xs text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    placeholder="g"
                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0F14] border border-zinc-700 text-white text-xs text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Carbs (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    placeholder="g"
                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0F14] border border-zinc-700 text-white text-xs text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400">Fat (g)</label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    placeholder="g"
                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0F14] border border-zinc-700 text-white text-xs text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-neon"
              >
                Log Custom Food Item
              </button>
            </form>
          </div>
        </div>
      </Modal>

      {/* AI Nutrition Coach Modal */}
      <Modal
        isOpen={isAiAdviceOpen}
        onClose={() => setIsAiAdviceOpen(false)}
        title="AI Nutrition & Meal Architecture"
        maxWidth="max-w-2xl"
      >
        <MedicalDisclaimer compact />

        {isFetchingAi ? (
          <LoadingSpinner text="Consulting sports nutrition engine..." size="md" />
        ) : aiAdvice ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                CALIBRATED MACRO BLUEPRINT
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-white">
                  {aiAdvice.calorieTarget} kcal / day
                </span>
                <span className="text-xs text-emerald-400 font-mono">
                  P: {aiAdvice.macros.proteinG}g • C: {aiAdvice.macros.carbsG}g • F: {aiAdvice.macros.fatG}g
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {aiAdvice.mealPlanRecommendation?.map((meal: any, i: number) => (
                <div key={i} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{meal.mealName}</span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {meal.calories} kcal
                    </span>
                  </div>
                  <ul className="text-[11px] text-zinc-400 space-y-0.5">
                    {meal.suggestions?.map((sug: string, sIdx: number) => (
                      <li key={sIdx}>• {sug}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {aiAdvice.tips && (
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-200 block mb-1">Performance Nutrition Keys:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {aiAdvice.tips.map((t: string, idx: number) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
