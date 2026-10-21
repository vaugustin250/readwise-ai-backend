import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ParentDashboardScreen } from './screens/ParentDashboardScreen';
import { AddChildScreen } from './screens/AddChildScreen';
import { AssessmentSelectionScreen } from './screens/AssessmentSelectionScreen';
import { BuddySelectionScreen } from './screens/BuddySelectionScreen';
import { ReadingAssessmentScreen } from './screens/ReadingAssessmentScreen';
import { CognitiveGameScreen } from './screens/CognitiveGameScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { LearningActivityScreen } from './screens/LearningActivityScreen';
import { ProgressDashboardScreen } from './screens/ProgressDashboardScreen';
import { ALL_BUDDIES, DEFAULT_BUDDY, getBuddyById } from './data/buddies';
import { authService } from './services/authService';
import { profileService } from './services/profileService';
import { sensorManager } from './services/sensorManager';
import { AssessmentResult, ChildProfile, ReadingBuddy, ScreenRoute } from './types';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<ScreenRoute>(() => {
    return authService.isAuthenticated() ? 'dashboard' : 'onboarding';
  });
  const [activeBuddy, setActiveBuddy] = useState<ReadingBuddy>(() => {
    try {
      const saved = localStorage.getItem('readwise_buddy_id');
      if (saved) return getBuddyById(saved);
    } catch (_) {
      // Ignore
    }
    return DEFAULT_BUDDY;
  });
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [latestResult, setLatestResult] = useState<AssessmentResult | null>(null);
  const [sensorsLive, setSensorsLive] = useState(false);

  // Initialize sensors and load default active child
  useEffect(() => {
    sensorManager.initializeSensors().then((ok) => setSensorsLive(ok));
    const unsubscribe = sensorManager.subscribe((data) => {
      setSensorsLive(data.isSensorsLive);
    });

    profileService.getChildren().then((children) => {
      if (children.length > 0 && !activeChild) {
        setActiveChild(children[0]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSelectBuddy = (buddy: ReadingBuddy) => {
    setActiveBuddy(buddy);
    try {
      localStorage.setItem('readwise_buddy_id', buddy.id);
    } catch (_) {
      // Ignore
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentRoute('login');
  };

  const getScreenTitle = () => {
    switch (currentRoute) {
      case 'onboarding':
        return 'Welcome';
      case 'login':
        return 'Guardian Sign In';
      case 'dashboard':
        return 'Parent Dashboard';
      case 'add_child':
        return 'Add Child Profile';
      case 'assessment_selection':
        return activeChild ? `${activeChild.name}’s Reading Quest 🌟` : 'Reading Quest';
      case 'buddy_select':
        return 'Choose Your Hero';
      case 'reading_assessment':
        return activeChild ? `${activeChild.name}’s Reading Trial` : 'Reading Assessment';
      case 'cognitive_game':
        return 'Ninja & Alien Brain Games';
      case 'results':
        return 'Assessment Results';
      case 'learning_activity':
        return 'Daily Practice Plan';
      case 'progress':
        return activeChild ? `${activeChild.name}’s Progress` : 'Longitudinal Progress';
      default:
        return 'ReadWise AI';
    }
  };

  const showHeader = currentRoute !== 'onboarding' && currentRoute !== 'login';

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#1E1B4B] flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      {showHeader && (
        <Header
          title={getScreenTitle()}
          buddy={activeBuddy}
          activeChild={activeChild}
          sensorsLive={sensorsLive}
          onNavigate={(route) => setCurrentRoute(route as ScreenRoute)}
          onLogout={handleLogout}
          showBack={currentRoute !== 'dashboard'}
          onBack={() => {
            if (currentRoute === 'results' || currentRoute === 'learning_activity' || currentRoute === 'progress') {
              setCurrentRoute('dashboard');
            } else if (currentRoute === 'reading_assessment' || currentRoute === 'cognitive_game') {
              setCurrentRoute('assessment_selection');
            } else if (currentRoute === 'assessment_selection' || currentRoute === 'add_child') {
              setCurrentRoute('dashboard');
            } else {
              setCurrentRoute('dashboard');
            }
          }}
        />
      )}

      <main className="flex-1">
        {currentRoute === 'onboarding' && (
          <OnboardingScreen
            buddy={activeBuddy}
            onGetStarted={() => setCurrentRoute('login')}
          />
        )}

        {currentRoute === 'login' && (
          <LoginScreen
            buddy={activeBuddy}
            onLoginSuccess={() => setCurrentRoute('dashboard')}
          />
        )}

        {currentRoute === 'dashboard' && (
          <ParentDashboardScreen
            buddy={activeBuddy}
            onSelectChild={(child) => {
              setActiveChild(child);
              setCurrentRoute('assessment_selection');
            }}
            onAddChild={() => setCurrentRoute('add_child')}
            onViewProgress={(child) => {
              if (child) setActiveChild(child);
              setCurrentRoute('progress');
            }}
            onSelectBuddy={() => setCurrentRoute('buddy_select')}
          />
        )}

        {currentRoute === 'add_child' && (
          <AddChildScreen
            buddy={activeBuddy}
            onChildAdded={() => setCurrentRoute('dashboard')}
            onCancel={() => setCurrentRoute('dashboard')}
          />
        )}

        {currentRoute === 'assessment_selection' && activeChild && (
          <AssessmentSelectionScreen
            child={activeChild}
            buddy={activeBuddy}
            onNavigate={(route) => setCurrentRoute(route as ScreenRoute)}
            onSelectBuddy={() => setCurrentRoute('buddy_select')}
          />
        )}

        {currentRoute === 'buddy_select' && (
          <BuddySelectionScreen
            currentBuddy={activeBuddy}
            onSelectBuddy={handleSelectBuddy}
            onBack={() => {
              if (activeChild) {
                setCurrentRoute('assessment_selection');
              } else {
                setCurrentRoute('dashboard');
              }
            }}
          />
        )}

        {currentRoute === 'reading_assessment' && (
          <ReadingAssessmentScreen
            child={activeChild || { id: '1', name: 'Arun', age: 9, grade: 'Grade 4', language: 'English' }}
            buddy={activeBuddy}
            onAssessmentFinished={(result) => {
              setLatestResult(result);
              setCurrentRoute('results');
            }}
            onSelectBuddy={() => setCurrentRoute('buddy_select')}
          />
        )}

        {currentRoute === 'cognitive_game' && (
          <CognitiveGameScreen
            child={activeChild || { id: '1', name: 'Arun', age: 9, grade: 'Grade 4', language: 'English' }}
            buddy={activeBuddy}
            onFinish={() => setCurrentRoute('assessment_selection')}
            onSelectBuddy={() => setCurrentRoute('buddy_select')}
          />
        )}

        {currentRoute === 'results' && latestResult && (
          <ResultsScreen
            child={activeChild || { id: '1', name: 'Arun', age: 9, grade: 'Grade 4', language: 'English' }}
            buddy={activeBuddy}
            result={latestResult}
            onGoToLearning={() => setCurrentRoute('learning_activity')}
            onReturnDashboard={() => setCurrentRoute('dashboard')}
          />
        )}

        {currentRoute === 'learning_activity' && (
          <LearningActivityScreen
            child={activeChild}
            buddy={activeBuddy}
            onSelectBuddy={() => setCurrentRoute('buddy_select')}
            onReturnDashboard={() => setCurrentRoute('dashboard')}
          />
        )}

        {currentRoute === 'progress' && (
          <ProgressDashboardScreen
            child={activeChild}
            buddy={activeBuddy}
            onReturnDashboard={() => setCurrentRoute('dashboard')}
          />
        )}
      </main>
    </div>
  );
};
