import React, { useState } from 'react';
import { Menu, Bell, Sun, Moon, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenMobileMenu?: () => void;
  onQuickStartWorkout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenMobileMenu,
  onQuickStartWorkout,
}) => {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard':
        return 'Performance Dashboard';
      case 'workouts':
        return 'Workout Programs';
      case 'exercises':
        return 'Exercise Library';
      case 'active-session':
        return 'Active Workout Session';
      case 'nutrition':
        return 'Nutrition & Macros';
      case 'progress':
        return 'Progress Analytics & Goals';
      case 'ai-coach':
        return 'AI Fitness Coach';
      case 'profile':
        return 'Athlete Profile';
      case 'settings':
        return 'Settings & Preferences';
      default:
        return 'FitTrack';
    }
  };

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#0B0F14]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
            {getPageTitle(currentPage)}
          </h1>
          <p className="text-[11px] text-zinc-400 hidden sm:block">
            FitTrack Intelligent Health & Performance System
          </p>
        </div>
      </div>

      {/* Right: Quick Actions, AI shortcut, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Launch Active Workout */}
        {currentPage !== 'active-session' && (
          <button
            onClick={onQuickStartWorkout || (() => onNavigate('active-session'))}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition shadow-neon"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Quick Workout</span>
          </button>
        )}

        {/* AI Coach Quick Pill */}
        {currentPage !== 'ai-coach' && (
          <button
            onClick={() => onNavigate('ai-coach')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/80 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        )}

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 shadow-neon" />
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User Avatar */}
        <div
          onClick={() => onNavigate('profile')}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-bold text-xs cursor-pointer shadow-sm ml-1"
          title={profile?.fullName || 'Profile'}
        >
          {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'A'}
        </div>
      </div>
    </header>
  );
};
