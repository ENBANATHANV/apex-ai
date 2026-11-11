const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE = rawApiUrl
  ? rawApiUrl.endsWith('/api')
    ? rawApiUrl
    : `${rawApiUrl.replace(/\/+$/, '')}/api`
  : '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('fittrack_token');
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  }

  // --- Auth APIs ---
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: { email: string; password: string; fullName: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // --- User & Dashboard APIs ---
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(profileData: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async completeOnboarding(onboardingData: any) {
    return this.request('/users/onboarding', {
      method: 'POST',
      body: JSON.stringify(onboardingData),
    });
  }

  async getDashboardSummary() {
    return this.request('/users/dashboard-summary');
  }

  // --- Workout APIs ---
  async getWorkouts(params?: { category?: string; difficulty?: string }) {
    const qs = params ? new URLSearchParams(params as any).toString() : '';
    return this.request(`/workouts${qs ? `?${qs}` : ''}`);
  }

  async getWorkoutById(id: string) {
    return this.request(`/workouts/${id}`);
  }

  async createWorkout(data: any) {
    return this.request('/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkout(id: string, data: any) {
    return this.request(`/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkout(id: string) {
    return this.request(`/workouts/${id}`, {
      method: 'DELETE',
    });
  }

  async getExercises(filters?: { muscleGroup?: string; equipment?: string; difficulty?: string; search?: string }) {
    const qs = filters ? new URLSearchParams(filters as any).toString() : '';
    return this.request(`/workouts/exercises${qs ? `?${qs}` : ''}`);
  }

  async startSession(planId?: string, dayNumber?: number, customTitle?: string) {
    return this.request('/workouts/session/start', {
      method: 'POST',
      body: JSON.stringify({ planId, dayNumber, customTitle }),
    });
  }

  async getActiveSession() {
    return this.request('/workouts/session/active');
  }

  async updateSet(setId: string, data: { actualReps?: number; weightKg?: number; completed?: boolean; rpe?: number }) {
    return this.request(`/workouts/session/set/update/${setId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addExerciseToSession(sessionId: string, exerciseId: string) {
    return this.request(`/workouts/session/${sessionId}/add-exercise`, {
      method: 'POST',
      body: JSON.stringify({ exerciseId }),
    });
  }

  async addSetToExercise(workoutExerciseId: string) {
    return this.request('/workouts/session/set/add', {
      method: 'POST',
      body: JSON.stringify({ workoutExerciseId }),
    });
  }

  async completeSession(sessionId: string, data: { notes?: string; durationSeconds: number }) {
    return this.request(`/workouts/session/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSessionHistory() {
    return this.request('/workouts/session/history');
  }

  // --- Nutrition APIs ---
  async getDailyNutrition(date?: string) {
    return this.request(`/nutrition/daily${date ? `?date=${date}` : ''}`);
  }

  async logMeal(data: { date?: string; mealType: string; foodItems: any[] }) {
    return this.request('/nutrition/log', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteMealItem(id: string) {
    return this.request(`/nutrition/log/${id}`, {
      method: 'DELETE',
    });
  }

  async logWater(amountMl: number, date?: string) {
    return this.request('/nutrition/water', {
      method: 'POST',
      body: JSON.stringify({ amountMl, date }),
    });
  }

  async getFoodDatabase(search?: string) {
    return this.request(`/nutrition/database${search ? `?q=${encodeURIComponent(search)}` : ''}`);
  }

  async getWeeklyNutrition() {
    return this.request('/nutrition/weekly');
  }

  // --- Progress APIs ---
  async getProgress() {
    return this.request('/progress');
  }

  async logProgress(data: any) {
    return this.request('/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProgressAnalytics() {
    return this.request('/progress/analytics');
  }

  async getGoals() {
    return this.request('/progress/goals');
  }

  async createGoal(data: any) {
    return this.request('/progress/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGoal(id: string, data: { currentValue?: number; status?: string }) {
    return this.request(`/progress/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- AI Coach APIs ---
  async generateAiWorkoutPlan(data: { focus?: string; daysPerWeek?: number; difficulty?: string; prompt?: string }) {
    return this.request('/ai/workout-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAiNutritionAdvice(targetCalories?: number) {
    return this.request('/ai/nutrition-advice', {
      method: 'POST',
      body: JSON.stringify({ targetCalories }),
    });
  }

  async sendChatMessage(message: string) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getChatHistory() {
    return this.request('/ai/chat/history');
  }

  // --- Notification APIs ---
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'POST',
    });
  }

  async clearNotifications() {
    return this.request('/notifications', {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
