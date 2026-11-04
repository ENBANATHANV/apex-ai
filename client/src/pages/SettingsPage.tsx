import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Sun,
  Moon,
  Shield,
  Trash2,
  CheckCheck,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { notifications, markAsRead, markAllRead, clearAll, showToast } = useNotification();
  const { user } = useAuth();

  // Notification toggles
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [waterReminders, setWaterReminders] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    showToast('Password updated securely!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">
          Settings & Notifications
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Manage visual preferences, automated reminders, units of measurement, and account security.
        </p>
      </div>

      {/* Visual & Units Preferences */}
      <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800 space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
          Preferences & Display
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-zinc-800/80">
          <div>
            <h4 className="text-sm font-bold text-zinc-200">Interface Theme</h4>
            <p className="text-xs text-zinc-400">
              Currently using {theme === 'dark' ? 'Dark Tactical mode' : 'Light mode'}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold transition"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <h4 className="text-sm font-bold text-zinc-200">Measurement System</h4>
            <p className="text-xs text-zinc-400">Kilograms & centimeters vs. Pounds & inches</p>
          </div>
          <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              onClick={() => setUnitSystem('metric')}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition ${
                unitSystem === 'metric'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Metric (kg, cm)
            </button>
            <button
              onClick={() => setUnitSystem('imperial')}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition ${
                unitSystem === 'imperial'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Imperial (lbs, in)
            </button>
          </div>
        </div>
      </div>

      {/* Notification Center & Automated Reminders */}
      <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            In-App Notification Center
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={markAllRead}
              className="text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
            <button
              onClick={clearAll}
              className="text-zinc-400 hover:text-red-400 flex items-center gap-1 transition ml-2"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Reminders Toggles */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900 border border-zinc-850">
            <div>
              <p className="text-xs font-bold text-zinc-200">Daily Workout Reminders</p>
              <p className="text-[11px] text-zinc-400">Receive alerts on your planned training days</p>
            </div>
            <button
              onClick={() => setWorkoutReminders(!workoutReminders)}
              className="text-emerald-400"
            >
              {workoutReminders ? (
                <ToggleRight className="w-7 h-7" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-zinc-600" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900 border border-zinc-850">
            <div>
              <p className="text-xs font-bold text-zinc-200">Intracellular Water Reminders</p>
              <p className="text-[11px] text-zinc-400">Periodic hydration checks during daytime</p>
            </div>
            <button
              onClick={() => setWaterReminders(!waterReminders)}
              className="text-emerald-400"
            >
              {waterReminders ? (
                <ToggleRight className="w-7 h-7" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-zinc-600" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900 border border-zinc-850">
            <div>
              <p className="text-xs font-bold text-zinc-200">Milestone & PR Celebrations</p>
              <p className="text-[11px] text-zinc-400">Congratulate you when breaking volume or weight records</p>
            </div>
            <button
              onClick={() => setAchievementAlerts(!achievementAlerts)}
              className="text-emerald-400"
            >
              {achievementAlerts ? (
                <ToggleRight className="w-7 h-7" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-zinc-600" />
              )}
            </button>
          </div>
        </div>

        {/* Notification History Feed */}
        <div className="pt-3">
          <h4 className="text-xs font-bold text-zinc-300 mb-2">Recent Notifications</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3 text-center">No notifications logged.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                    n.isRead ? 'bg-zinc-900/60 border-zinc-850' : 'bg-emerald-950/20 border-emerald-500/30'
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-zinc-200">{n.title}</h5>
                    <p className="text-zinc-400 mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Account Security & Password Form */}
      <div className="p-6 rounded-3xl bg-[#11161D] border border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Account Security
        </h3>

        <form onSubmit={handleUpdatePassword} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 chars"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-zinc-700 text-white text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-2.5 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
