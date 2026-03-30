import { useState } from 'react';
import { isMobileDevice } from './lib/isMobile';
import MobileView from './components/MobileView';
import TVShowWebView from './components/TVShowWebView';
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
  // Device detection
  const isMobile = isMobileDevice();
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

  if (isMobile) {
    return <MobileView />;
  } else {
    return <TVShowWebView />;
  }
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
