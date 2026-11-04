export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  age?: number | null;
  gender?: string | null;
  height?: number | null; // cm
  weight?: number | null; // kg
  targetWeight?: number | null; // kg
  fitnessLevel?: string | null;
  primaryGoal?: string | null;
  preferredWorkouts?: string | null;
  workoutDaysPerWeek?: number | null;
  equipment?: string | null;
  dietaryPreference?: string | null;
  dailyCalorieTarget?: number | null;
  dailyWaterTargetMl?: number | null;
  unitPreference?: string | null;
  onboardingCompleted: boolean;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  profile?: UserProfile | null;
}

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  category: string;
  muscleGroup: string;
  secondaryMuscles?: string | null;
  equipment: string;
  difficulty: string;
  instructions: string;
  tips?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
}

export interface WorkoutPlanExercise {
  id: string;
  workoutPlanId: string;
  exerciseId: string;
  exercise: Exercise;
  dayOfWeek: number;
  order: number;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
}

export interface WorkoutPlan {
  id: string;
  userId?: string | null;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  durationWeeks: number;
  daysPerWeek: number;
  isAiGenerated: boolean;
  isCustom: boolean;
  exercises?: WorkoutPlanExercise[];
  createdAt: string;
}

export interface ExerciseSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  targetReps: number;
  actualReps?: number | null;
  weightKg?: number | null;
  completed: boolean;
  rpe?: number | null;
}

export interface WorkoutExercise {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  notes?: string | null;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  planId?: string | null;
  title: string;
  notes?: string | null;
  startedAt: string;
  completedAt?: string | null;
  durationSeconds: number;
  totalVolumeKg: number;
  caloriesBurned: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  sessionExercises?: WorkoutExercise[];
}

export interface FoodItem {
  id: string;
  mealId: string;
  name: string;
  servingSize: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number | null;
}

export interface Meal {
  id: string;
  userId: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  name?: string | null;
  foodItems: FoodItem[];
}

export interface FitnessGoal {
  id: string;
  userId: string;
  title: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate?: string | null;
  status: 'active' | 'completed' | 'cancelled';
}

export interface ProgressRecord {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  bmi?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  armsCm?: number | null;
  thighsCm?: number | null;
  photoUrl?: string | null;
  notes?: string | null;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'REMINDER' | 'ACHIEVEMENT' | 'SYSTEM' | 'WEEKLY_REPORT';
  isRead: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  profile: UserProfile;
  metrics: {
    steps: { current: number; target: number };
    caloriesBurned: { today: number; weeklyTotal: number };
    workoutDurationMinutes: { today: number; weeklyTotal: number };
    water: { currentMl: number; targetMl: number };
    nutrition: {
      calories: { current: number; target: number };
      proteinG: number;
      carbsG: number;
      fatG: number;
    };
  };
  currentGoal?: FitnessGoal | null;
  activeSession?: WorkoutSession | null;
  recentWorkouts: WorkoutSession[];
  weeklyActivity: Array<{
    date: string;
    day: string;
    calories: number;
    minutes: number;
    workouts: number;
  }>;
  dailyQuote: { quote: string; author: string };
}
