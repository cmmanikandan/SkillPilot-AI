import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/useAuth';
import { LandingPage } from './components/LandingPage';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';

import { CurriculumView } from './components/CurriculumView';
import { AIMentor } from './components/AIMentor';
import { CodingLab } from './components/CodingLab';
import { TechGames } from './components/TechGames';
import { ProfileView } from './components/ProfileView';
import { ExtraCourses } from './components/ExtraCourses';
import { PlatformGuide } from './components/PlatformGuide';
import { LeaderboardView } from './components/LeaderboardView';
import { AchievementsView } from './components/AchievementsView';
import { StoreView } from './components/StoreView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getDocFromServer, doc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useEffect } from 'react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Firebase connection error: The client is offline.");
        }
      }
    };
    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
      {activeTab === 'curriculum' && <CurriculumView type="main" />}
      {activeTab === 'coding' && <CodingLab />}
      {activeTab === 'mentor' && <AIMentor />}
      {activeTab === 'games' && <TechGames />}
      {activeTab === 'profile' && <ProfileView />}
      {activeTab === 'leaderboard' && <LeaderboardView />}
      {activeTab === 'achievements' && <AchievementsView />}
      {activeTab === 'store' && <StoreView />}
      {activeTab === 'extra' && <ExtraCourses onCourseStarted={(courseId) => setActiveTab(`extra-course-${courseId}`)} onContinueCourse={(courseId) => setActiveTab(`extra-course-${courseId}`)} />}
      {activeTab.startsWith('extra-course-') && <CurriculumView type="extra" courseId={activeTab.replace('extra-course-', '')} onBack={() => setActiveTab('extra')} />}
      {activeTab === 'guide' && <PlatformGuide />}
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
