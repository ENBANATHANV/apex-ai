import React from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  PlayCircle,
  Utensils,
  TrendingUp,
  Sparkles,
  User,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  hasActiveSession?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  hasActiveSession,
}) => {
  const { user, profile, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workout Plans', icon: Dumbbell },
    { id: 'exercises', label: 'Exercise Library', icon: BookOpen },
    {
      id: 'active-session',
      label: 'Active Workout',
      icon: PlayCircle,
      badge: hasActiveSession ? 'LIVE' : undefined,
    },
    { id: 'nutrition', label: 'Nutrition & Macros', icon: Utensils },
    { id: 'progress', label: 'Progress & Analytics', icon: TrendingUp },
    { id: 'ai-coach', label: 'AI Fitness Coach', icon: Sparkles, glow: true },
    { id: 'profile', label: 'Athlete Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0F14] border-r border-zinc-800/80 flex flex-col h-screen select-none shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-neon">
            <Dumbbell className="w-5 h-5 text-black font-bold transform -rotate-12 group-hover:rotate-0 transition duration-300" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1 font-display">
              FIT<span className="text-emerald-400">TRACK</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-emerald-500/80 font-semibold block -mt-1">
              AI PERFORMANCE
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(34,197,94,0.15)] font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive
                      ? 'text-emerald-400'
                      : item.glow
                      ? 'text-emerald-400/80'
                      : 'text-zinc-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-500 text-black animate-pulse">
                  {item.badge}
                </span>
              )}
              {item.glow && !item.badge && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-neon" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-850/50 transition">
          <div
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-bold text-xs shrink-0 shadow-sm">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {profile?.fullName || user?.email?.split('@')[0] || 'Athlete'}
              </p>
              <p className="text-[10px] text-emerald-400/90 truncate font-mono">
                {profile?.primaryGoal || 'FitTrack Member'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
