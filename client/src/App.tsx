import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNotification } from './context/NotificationContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoadingSpinner } from './components/LoadingSpinner';
import { api } from './services/api';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { ExerciseLibraryPage } from './pages/ExerciseLibraryPage';
import { ActiveWorkoutPage } from './pages/ActiveWorkoutPage';
import { NutritionPage } from './pages/NutritionPage';
import { ProgressPage } from './pages/ProgressPage';
import { AiCoachPage } from './pages/AiCoachPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  const { showToast } = useNotification();

  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // Sync initial page based on session
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (!profile?.onboardingCompleted) {
          setCurrentPage('onboarding');
        } else if (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register') {
          setCurrentPage('dashboard');
        }
      } else {
        if (
          currentPage !== 'landing' &&
          currentPage !== 'login' &&
          currentPage !== 'register'
        ) {
          setCurrentPage('landing');
        }
      }
    }
  }, [user, profile, isLoading]);

  // Check if there is an active workout session in progress
  const checkActiveSession = async () => {
    if (!user) return;
    try {
      const res = await api.getActiveSession();
      if (res.success && res.data) {
        setHasActiveSession(true);
      } else {
        setHasActiveSession(false);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      checkActiveSession();
    }
  }, [user, currentPage]);

  const handleStartWorkout = async (planId?: string, dayNumber?: number) => {
    try {
      const res = await api.startSession(planId, dayNumber);
      if (res.success) {
        showToast('Workout session started! Timer running.', 'success');
        setHasActiveSession(true);
        setCurrentPage('active-session');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to start session.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070A0E] flex items-center justify-center">
        <LoadingSpinner text="Initializing FitTrack OS..." size="lg" />
      </div>
    );
  }

  // Standalone Public Pages
  if (currentPage === 'landing') {
    return <LandingPage onNavigate={setCurrentPage} />;
  }
  if (currentPage === 'login') {
    return <LoginPage onNavigate={setCurrentPage} />;
  }
  if (currentPage === 'register') {
    return <RegisterPage onNavigate={setCurrentPage} />;
  }
  if (currentPage === 'onboarding') {
    return <OnboardingPage onNavigate={setCurrentPage} />;
  }

  // Authenticated App Shell with Sidebar & Navbar
  return (
    <div className="min-h-screen bg-[#070A0E] text-slate-100 flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
          }}
          hasActiveSession={hasActiveSession}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar
              currentPage={currentPage}
              onNavigate={(page) => {
                setCurrentPage(page);
                setIsMobileMenuOpen(false);
              }}
              hasActiveSession={hasActiveSession}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onQuickStartWorkout={() => handleStartWorkout()}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={setCurrentPage}
              onStartWorkout={(planId) => handleStartWorkout(planId)}
            />
          )}

          {currentPage === 'workouts' && (
            <WorkoutsPage
              onStartWorkout={(planId, day) => handleStartWorkout(planId, day)}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'exercises' && <ExerciseLibraryPage />}

          {currentPage === 'active-session' && (
            <ActiveWorkoutPage
              onNavigate={setCurrentPage}
              onSessionFinished={() => {
                setHasActiveSession(false);
                checkActiveSession();
              }}
            />
          )}

          {currentPage === 'nutrition' && <NutritionPage />}

          {currentPage === 'progress' && <ProgressPage />}

          {currentPage === 'ai-coach' && <AiCoachPage onNavigate={setCurrentPage} />}

          {currentPage === 'profile' && <ProfilePage />}

          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};
