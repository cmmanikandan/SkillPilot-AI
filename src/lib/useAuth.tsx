import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  levelUp: number | null;
  clearLevelUp: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, levelUp: null, clearLevelUp: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const prevLevelRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        prevLevelRef.current = null;
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let unsubscribeProgress: (() => void) | null = null;

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (userSnap) => {
      if (unsubscribeProgress) unsubscribeProgress();

      unsubscribeProgress = onSnapshot(doc(db, 'progress', user.uid), (progSnap) => {
        const userData = userSnap.exists() ? userSnap.data() : {};
        const progData = progSnap.exists() ? progSnap.data() : { xp: 0, completedDays: [], currentDay: 1 };
        
        const xp = progData.xp || 0;
        
        let level = 1;
        let xpForNextLevel = 250;
        let currentLevelXp = 0;
        
        while (xp >= currentLevelXp + xpForNextLevel) {
          currentLevelXp += xpForNextLevel;
          level++;
          xpForNextLevel += 250;
        }
        
        const xpProgress = xp - currentLevelXp;
        const xpRequired = xpForNextLevel;
        
        // Calculate streak
        const completedDays = (progData.completedDays || []) as string[];
        const sortedDays = [...new Set(completedDays)].filter(d => typeof d === 'string').sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedDays.length; i++) {
          const day = new Date(sortedDays[i]);
          day.setHours(0, 0, 0, 0);
          
          const diffDays = Math.floor((today.getTime() - day.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === i) {
            streak++;
          } else if (diffDays > i) {
            break;
          }
        }
        
        if (prevLevelRef.current !== null && level > prevLevelRef.current) {
          setLevelUp(level);
        }
        prevLevelRef.current = level;
        
        setProfile({ 
          ...userData, 
          ...progData, 
          level,
          xp,
          xpProgress,
          xpRequired,
          streak
        });
        console.log("useAuth: profile updated", { ...userData, ...progData, level, xp, xpProgress, xpRequired });
        setLoading(false);
      }, (error) => {
        console.error("Progress fetch error:", error);
        setLoading(false);
      });
    }, (error) => {
      console.error("Profile fetch error:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeProfile();
      if (unsubscribeProgress) unsubscribeProgress();
    };
  }, [user]);

  const clearLevelUp = () => setLevelUp(null);

  return (
    <AuthContext.Provider value={{ user, profile, loading, levelUp, clearLevelUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
