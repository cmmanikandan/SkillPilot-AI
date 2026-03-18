import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  CheckCircle2, 
  PlayCircle, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  BookOpen,
  ExternalLink,
  Trophy,
  ArrowLeft,
  Shield,
  Layers,
  Briefcase,
  Award
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';
import { generateCurriculum } from '../lib/gemini';
import { QuizSystem } from './QuizSystem';
import { Onboarding } from './Onboarding';
import { FlashcardsModal } from './FlashcardsModal';
import { CapstoneModal } from './CapstoneModal';
import { CertificateGenerator } from './CertificateGenerator';

interface CurriculumViewProps {
  type?: 'main' | 'extra';
  courseId?: string;
  onBack?: () => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({ type = 'main', courseId, onBack }) => {
  console.log("CurriculumView rendering");
  const { user, profile } = useAuth();
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [activeCurriculumIndex, setActiveCurriculumIndex] = useState(() => {
    if (type === 'extra') return 0;
    const saved = localStorage.getItem('activeCurriculumIndex');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [curriculumProgress, setCurriculumProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState<any>(null); // { topic: string, difficulty: string, day: number }
  const [showFlashcards, setShowFlashcards] = useState<string | null>(null);
  const [showCapstone, setShowCapstone] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [retaking, setRetaking] = useState(false);
  const [celebration, setCelebration] = useState<{ shield: string, courseTitle: string } | null>(null);

  useEffect(() => {
    if (type === 'main') {
      localStorage.setItem('activeCurriculumIndex', activeCurriculumIndex.toString());
    }
  }, [activeCurriculumIndex, type]);

  useEffect(() => {
    if (showOnboarding && profile?.onboardingComplete && !generating && curriculums.length === 0) {
      handleGenerate();
      setShowOnboarding(false);
    }
  }, [profile?.onboardingComplete, showOnboarding, generating, curriculums.length]);

  useEffect(() => {
    if (!user) return;

    const fetchCurriculums = async () => {
      const q = query(collection(db, 'curriculums'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        
        if (type === 'main') {
          docs = docs.filter(d => !d.isExtra);
        } else if (type === 'extra' && courseId) {
          docs = docs.filter(d => d.courseId === courseId);
        }

        docs.sort((a: any, b: any) => {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setCurriculums(docs);
      }
      setLoading(false);
    };

    fetchCurriculums();
  }, [user, type, courseId]);

  useEffect(() => {
    if (!user || curriculums.length === 0) return;
    
    const activeCurriculum = curriculums[activeCurriculumIndex];
    if (!activeCurriculum) return;

    const unsubscribe = onSnapshot(doc(db, 'curriculumProgress', activeCurriculum.id), (snap) => {
      if (snap.exists()) {
        setCurriculumProgress(snap.data());
      } else {
        // Initialize progress if it doesn't exist
        const initialProgress = {
          userId: user.uid,
          completedDays: [],
          currentDay: 1,
          assignments: {},
          resourceVisits: {}
        };
        setDoc(doc(db, 'curriculumProgress', activeCurriculum.id), initialProgress).catch(err => {
          console.error("Error initializing progress:", err);
        });
        setCurriculumProgress(initialProgress);
      }
    }, (error) => {
      console.error("Curriculum progress snapshot error:", error);
    });

    return () => unsubscribe();
  }, [user, curriculums, activeCurriculumIndex]);

  const curriculum = curriculums[activeCurriculumIndex];

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      // Fetch latest profile to ensure we have the newest onboarding data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const latestProfile = userDoc.exists() ? userDoc.data() : profile;
      
      if (!latestProfile) throw new Error("Profile not found");

      const plan = await generateCurriculum(latestProfile);
      const curriculumData = {
        userId: user.uid,
        title: `${latestProfile.role} Mastery Path`,
        days: plan,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'curriculums'), curriculumData);
      setActiveCurriculumIndex(0);
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setGenerating(false);
    }
  };

  const resetProgress = async () => {
    if (!user || !curriculum) return;
    if (!confirm("Are you sure you want to reset progress for THIS curriculum? This will clear all completed days and assignments for this course only.")) return;
    
    setResetting(true);
    try {
      const initialProgress = {
        userId: user.uid,
        completedDays: [],
        currentDay: 1,
        assignments: {},
        resourceVisits: {}
      };
      await setDoc(doc(db, 'curriculumProgress', curriculum.id), initialProgress);
      setCurriculumProgress(initialProgress);
      alert("Progress reset successfully.");
    } catch (error) {
      console.error("Reset error:", error);
    } finally {
      setResetting(false);
    }
  };

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const completeDay = async (day: number) => {
    if (!user || !curriculum || !curriculumProgress || !profile) return;
    
    try {
      const completedDays = curriculumProgress.completedDays || [];
      const newCompleted = completedDays.includes(day) 
        ? completedDays 
        : [...completedDays, day];
      
      const nextDay = Math.max(curriculumProgress.currentDay || 1, day + 1);
      
      await setDoc(doc(db, 'curriculumProgress', curriculum.id), {
        userId: user.uid,
        completedDays: newCompleted,
        currentDay: nextDay,
        lastCompletedAt: new Date().toISOString()
      }, { merge: true });

      const totalDays = curriculum.days.length;
      const oldPercent = (completedDays.length / totalDays) * 100;
      const newPercent = (newCompleted.length / totalDays) * 100;
      
      let newShield = null;
      if (newPercent >= 50 && oldPercent < 50) {
        newShield = 'silver';
      } else if (newPercent >= 25 && oldPercent < 25) {
        newShield = 'bronze';
      }

      const updateData: any = {
        xp: (profile?.xp || 0) + 50
      };

      if (newShield) {
        updateData[`courseShields.${curriculum.id}`] = {
          title: curriculum.title,
          shield: newShield,
          earnedAt: new Date().toISOString()
        };
      }

      await setDoc(doc(db, 'progress', user.uid), updateData, { merge: true });

      setShowQuiz(null);
      if (newShield) {
        setCelebration({ shield: newShield, courseTitle: curriculum.title });
      }
    } catch (error) {
      console.error("Error completing day:", error);
      alert("Failed to save progress. Please check your connection and try again.");
    }
  };

  const completeCourse = async () => {
    if (!user || !curriculum || !curriculumProgress || !profile) return;
    
    try {
      await setDoc(doc(db, 'curriculumProgress', curriculum.id), {
        isFinished: true,
        finishedAt: new Date().toISOString()
      }, { merge: true });

      // Update global XP with a big bonus and add a badge
      const newBadge = {
        name: `${curriculum.title} Mastery`,
        earnedAt: new Date().toISOString()
      };
      
      const existingBadges = profile?.badges || [];
      const hasBadge = existingBadges.some((b: any) => b.name === newBadge.name);

      await setDoc(doc(db, 'progress', user.uid), {
        xp: (profile?.xp || 0) + 500,
        badges: hasBadge ? existingBadges : [...existingBadges, newBadge],
        [`courseShields.${curriculum.id}`]: {
          title: curriculum.title,
          shield: 'gold',
          earnedAt: new Date().toISOString()
        }
      }, { merge: true });

      setShowQuiz(null);
      setCelebration({ shield: 'gold', courseTitle: curriculum.title });
    } catch (error) {
      console.error("Error completing course:", error);
      alert("Failed to save progress. Please check your connection and try again.");
    }
  };

  const trackResourceVisit = async (day: number, resourceName: string, url: string) => {
    if (!user || !curriculum || !curriculumProgress || !resourceName) return;
    
    const sanitizedName = resourceName.replace(/[.#$[\]]/g, '_');
    const visitKey = `${day}_${sanitizedName}`;
    const currentVisits = curriculumProgress.resourceVisits || {};
    
    if (!currentVisits[visitKey]) {
      await setDoc(doc(db, 'curriculumProgress', curriculum.id), {
        [`resourceVisits.${visitKey}`]: {
          visitedAt: new Date().toISOString(),
          resourceName: resourceName,
          day
        }
      }, { merge: true });

      // Update global XP
      await setDoc(doc(db, 'progress', user.uid), {
        xp: (profile?.xp || 0) + 10
      }, { merge: true });
    }
    
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) return <div className="text-center py-20">Loading your path...</div>;

  if (showQuiz) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <QuizSystem 
          topic={showQuiz.topic}
          difficulty={showQuiz.difficulty}
          isFinal={showQuiz.day === 'final'}
          onComplete={(score) => {
            if (score >= 50) {
              if (showQuiz.day === 'final') {
                completeCourse();
              } else {
                completeDay(showQuiz.day);
              }
            } else {
              setShowQuiz(null);
            }
          }}
          onClose={() => setShowQuiz(null)}
        />
      </div>
    );
  }

  if (!curriculum) {
    if (type === 'extra') {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <h2 className="text-3xl font-bold mb-2">Course not found</h2>
          <p className="text-slate-400">This extra course could not be loaded.</p>
          {onBack && (
            <button onClick={onBack} className="px-8 py-4 bg-brand-purple rounded-2xl font-bold">
              Go Back
            </button>
          )}
        </div>
      );
    }

    if (showOnboarding && !profile?.onboardingComplete) {
      return (
        <div className="max-w-4xl mx-auto py-10">
          <Onboarding />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-purple/10 flex items-center justify-center text-brand-purple">
          <Sparkles size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">Ready to start your journey?</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Our AI will analyze your profile and generate a personalized learning path just for you.
          </p>
        </div>
        <button 
          onClick={() => {
            if (!profile?.onboardingComplete) {
              setShowOnboarding(true);
            } else {
              handleGenerate();
            }
          }}
          disabled={generating}
          className="px-8 py-4 bg-brand-purple rounded-2xl font-bold neon-glow flex items-center gap-2 disabled:opacity-50"
        >
          {generating ? 'Generating your path...' : 'Start Course'} <Sparkles size={20} />
        </button>
      </div>
    );
  }

  if (retaking) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <Onboarding 
          onComplete={() => {
            setRetaking(false);
            handleGenerate();
          }} 
          onCancel={() => setRetaking(false)}
        />
      </div>
    );
  }

  const renderCelebrationModal = () => {
    if (!celebration) return null;

    const colors = {
      bronze: 'from-amber-700 to-amber-900 text-amber-500 border-amber-700/50',
      silver: 'from-slate-300 to-slate-500 text-slate-200 border-slate-400/50',
      gold: 'from-yellow-400 to-yellow-600 text-yellow-100 border-yellow-500/50'
    };
    
    const titles = {
      bronze: 'Bronze Shield Unlocked!',
      silver: 'Silver Shield Unlocked!',
      gold: 'Gold Shield Unlocked!'
    };

    const messages = {
      bronze: `Great start! You've completed 25% of ${celebration.courseTitle}. Keep going!`,
      silver: `Halfway there! You've completed 50% of ${celebration.courseTitle}. You're doing amazing!`,
      gold: `Incredible! You've fully mastered ${celebration.courseTitle} and earned 500 XP.`
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`glass max-w-md w-full p-10 rounded-[3rem] text-center space-y-6 border-4 bg-gradient-to-br ${colors[celebration.shield as keyof typeof colors]} relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          <div className="relative z-10">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-32 h-32 mx-auto rounded-full bg-black/40 flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/10 mb-6"
            >
              <Shield size={64} className="drop-shadow-2xl" />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-3xl font-black mb-4 tracking-tight text-white">{titles[celebration.shield as keyof typeof titles]}</h2>
              <p className="text-lg text-white/90">{messages[celebration.shield as keyof typeof messages]}</p>
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => setCelebration(null)}
              className="w-full py-4 rounded-2xl font-bold bg-black/20 hover:bg-black/40 text-white transition-colors mt-8"
            >
              Awesome!
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {renderCelebrationModal()}
      {type === 'extra' && onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={20} /> Back to Extra Courses
        </button>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black tracking-tight">{curriculum.title}</h1>
            {curriculums.length > 1 && type === 'main' && (
              <select 
                value={activeCurriculumIndex}
                onChange={(e) => setActiveCurriculumIndex(parseInt(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs font-bold outline-none focus:border-brand-purple/50"
              >
                {curriculums.map((c, i) => (
                  <option key={c.id} value={i}>
                    {c.title} {c.createdAt ? `(${new Date(c.createdAt).toLocaleDateString()})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-slate-400">
              Day {curriculumProgress?.currentDay || 1} of {curriculum.days.length} • {curriculumProgress?.completedDays?.length || 0} days completed
            </p>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider animate-pulse border border-emerald-500/20">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
              {12 + activeCurriculumIndex * 3} Students Live
            </div>
            <button 
              onClick={resetProgress}
              disabled={resetting}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-red-400 transition-colors"
            >
              {resetting ? 'Resetting...' : 'Reset Progress'}
            </button>
            {type === 'main' && (
              <button 
                onClick={() => setRetaking(true)}
                className="text-[10px] font-bold uppercase tracking-wider text-brand-purple hover:text-brand-purple/80 transition-colors"
              >
                Change Learning Path
              </button>
            )}
          </div>
        </div>
        <div className="glass px-4 py-2 rounded-xl text-sm font-bold text-brand-purple self-start">
          {curriculum.days.length} Day {curriculum.isExtra ? 'Intensive' : 'Sprint'}
        </div>
      </div>

      <div className="space-y-4">
        {curriculum.days.map((day: any) => {
          const isCompleted = curriculumProgress?.completedDays?.includes(day.day);
          const isLocked = day.day > (curriculumProgress?.currentDay || 1);
          const isCurrent = day.day === (curriculumProgress?.currentDay || 1);

          return (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass rounded-3xl overflow-hidden border-2 transition-all ${isCurrent ? 'border-brand-purple' : 'border-transparent'}`}
            >
              <div 
                onClick={() => !isLocked && toggleDay(day.day)}
                className={`p-6 flex items-center justify-between cursor-pointer ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${isCompleted ? 'bg-emerald-500/20 text-emerald-500' : isCurrent ? 'bg-brand-purple text-white neon-glow' : 'bg-white/5 text-slate-400'}`}>
                    {isCompleted ? <CheckCircle2 size={24} /> : day.day}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{day.topic}</h3>
                    <p className="text-sm text-slate-500">{day.difficulty} • {day.tasks.length} tasks</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {isLocked ? <Lock size={20} className="text-slate-600" /> : expandedDay === day.day ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedDay === day.day && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  className="px-6 pb-8 pt-2 border-t border-white/5 space-y-6"
                >
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Today's Tasks</h4>
                    <div className="space-y-2">
                      {day.tasks.map((task: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Resources</h4>
                    <div className="flex flex-wrap gap-2">
                      {day.resources.map((res: any, i: number) => {
                        const isObject = typeof res === 'object' && res !== null;
                        const name = isObject ? res.name : res;
                        const url = isObject ? res.url : `https://www.google.com/search?q=${encodeURIComponent(name + ' tutorial')}`;
                        const sanitizedName = name?.replace(/[.#$[\]]/g, '_');
                        const isVisited = curriculumProgress?.resourceVisits?.[`${day.day}_${sanitizedName}`];

                        return (
                          <button 
                            key={i} 
                            onClick={() => trackResourceVisit(day.day, name, url)}
                            className="px-4 py-2 glass rounded-xl text-sm flex items-center gap-2 hover:bg-white/10 transition-all text-left"
                          >
                            <BookOpen size={14} /> {name} <ExternalLink size={14} />
                            {isVisited && (
                              <CheckCircle2 size={14} className="text-emerald-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {!isCompleted && isCurrent && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          onClick={() => setShowFlashcards(day.topic)}
                          className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-white/5 hover:bg-white/10 border border-white/10"
                        >
                          <Layers size={20} /> Smart Flashcards
                        </button>
                        <button 
                          onClick={() => setShowQuiz({ topic: day.topic, difficulty: day.difficulty, day: day.day })}
                          className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-brand-purple neon-glow hover:scale-[1.02]"
                        >
                          Take Daily Quiz <Sparkles size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {curriculumProgress?.completedDays?.length === curriculum.days.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass rounded-3xl overflow-hidden border-2 p-8 text-center space-y-6 ${curriculumProgress.isFinished ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-amber-500/50 bg-amber-500/5'}`}
        >
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl ${curriculumProgress.isFinished ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/50' : 'bg-amber-500/20 text-amber-500'}`}>
            {curriculumProgress.isFinished ? <Shield size={48} className="drop-shadow-lg" /> : <Trophy size={48} />}
          </div>
          <div>
            <h2 className={`text-4xl font-black mb-2 tracking-tight ${curriculumProgress.isFinished ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200' : 'text-amber-500'}`}>
              {curriculumProgress.isFinished ? 'Mastery Badge Unlocked!' : 'Course Completed!'}
            </h2>
            <p className="text-slate-300 text-lg">
              {curriculumProgress.isFinished 
                ? `You've officially mastered ${curriculum.title} and earned a new shield for your profile!` 
                : `You've finished all ${curriculum.days.length} days. Take the final exam to officially master this course and earn your certificate.`}
            </p>
          </div>
          {!curriculumProgress.isFinished && (
            <button
              onClick={() => setShowQuiz({ topic: `Comprehensive Final Exam on ${curriculum.title}`, difficulty: 'Advanced', day: 'final' })}
              className="px-8 py-4 bg-amber-500 text-black rounded-2xl font-bold neon-glow flex items-center justify-center gap-2 mx-auto hover:scale-[1.02] transition-transform"
            >
              Take Final Exam <Sparkles size={20} />
            </button>
          )}
          {curriculumProgress.isFinished && (
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setShowCertificate(true)}
                className="px-6 py-3 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-500/30 transition-all"
              >
                <Award size={20} /> Get Certificate
              </button>
              <button
                onClick={() => setShowCapstone(true)}
                className="px-6 py-3 bg-brand-purple/20 text-brand-purple border border-brand-purple/30 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-purple/30 transition-all"
              >
                <Briefcase size={20} /> Capstone Project
              </button>
              {type === 'main' && (
                <button
                  onClick={() => setRetaking(true)}
                  className="px-6 py-3 bg-emerald-500 text-black rounded-xl font-bold neon-glow flex items-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  Start New Path <Sparkles size={20} />
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}

      {showFlashcards && (
        <FlashcardsModal 
          topic={showFlashcards} 
          onClose={() => setShowFlashcards(null)} 
        />
      )}

      {showCapstone && curriculum && (
        <CapstoneModal 
          courseTitle={curriculum.title} 
          onClose={() => setShowCapstone(false)} 
        />
      )}

      {showCertificate && curriculum && profile && (
        <CertificateGenerator 
          courseTitle={curriculum.title} 
          studentName={profile.displayName || user?.displayName || 'Student'} 
          onClose={() => setShowCertificate(false)} 
        />
      )}
    </div>
  );
};
