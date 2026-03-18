import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Code2, 
  Terminal, 
  Cpu, 
  Globe, 
  Database, 
  Layers, 
  Sparkles,
  ChevronRight,
  Loader2,
  CheckCircle2,
  TrendingUp,
  X
} from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { generateExtraCourse } from '../lib/gemini';
import { collection, addDoc, query, where, getDocs, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const COURSES = [
  { id: 'python', name: 'Python for Data Science', icon: Terminal, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'java', name: 'Java Enterprise Edition', icon: Coffee, color: 'text-red-400', bg: 'bg-red-400/10' },
  { id: 'react', name: 'Advanced React Patterns', icon: Code2, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { id: 'node', name: 'Node.js Backend Mastery', icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'sql', name: 'SQL & Database Design', icon: Database, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'devops', name: 'DevOps & Cloud Native', icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 'typescript', name: 'TypeScript Deep Dive', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'ai', name: 'Generative AI & LLMs', icon: Sparkles, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
];

function Coffee(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" x2="6" y1="2" y2="4" />
      <line x1="10" x2="10" y1="2" y2="4" />
      <line x1="14" x2="14" y1="2" y2="4" />
    </svg>
  );
}

export const ExtraCourses: React.FC<{ onCourseStarted?: (courseId: string) => void, onContinueCourse?: (courseId: string) => void }> = ({ onCourseStarted, onContinueCourse }) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Record<string, any>>({});
  const [courseProgress, setCourseProgress] = useState<Record<string, any>>({});
  const [selectedDifficulty, setSelectedDifficulty] = useState<Record<string, string>>({});
  const [viewState, setViewState] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState('Beginner');

  useEffect(() => {
    if (!user) return;

    let unsubscribes: (() => void)[] = [];

    const fetchEnrollments = async () => {
      const q = query(
        collection(db, 'curriculums'), 
        where('userId', '==', user.uid),
        where('isExtra', '==', true)
      );
      const snap = await getDocs(q);
      const enrollments: Record<string, any> = {};
      
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.courseId) {
          if (!enrollments[data.courseId] || new Date(data.createdAt) > new Date(enrollments[data.courseId].createdAt)) {
            enrollments[data.courseId] = { id: d.id, ...data };
          }
        }
      });
      
      setEnrolledCourses(enrollments);

      const enrollmentList = Object.values(enrollments);
      if (enrollmentList.length === 0) return;

      unsubscribes = enrollmentList.map(course => {
        return onSnapshot(doc(db, 'curriculumProgress', course.id), (progSnap) => {
          if (progSnap.exists()) {
            const data = progSnap.data();
            setCourseProgress(prev => ({
              ...prev,
              [course.courseId]: data
            }));
          } else {
            setCourseProgress(prev => ({
              ...prev,
              [course.courseId]: { completedDays: [], currentDay: 1 }
            }));
          }
        });
      });
    };

    fetchEnrollments();
    return () => unsubscribes.forEach(unsub => unsub());
  }, [user]);

  const handleEnroll = async (course: typeof COURSES[0]) => {
    if (!user || !profile) return;
    setLoading(course.id);
    
    try {
      if (enrolledCourses[course.id]) {
        alert("You are already enrolled in this course!");
        return;
      }

      const difficulty = selectedDifficulty[course.id] || 'Beginner';
      const customProfile = { ...profile, experience: difficulty };
      const plan = await generateExtraCourse(course.name, customProfile);
      
      const curriculumData = {
        userId: user.uid,
        courseId: course.id,
        title: course.name,
        days: plan,
        isExtra: true,
        difficulty: difficulty,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'curriculums'), curriculumData);
      setEnrolledCourses(prev => ({
        ...prev,
        [course.id]: { id: docRef.id, ...curriculumData }
      }));
      onCourseStarted?.(course.id);
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("Failed to start course. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleCustomEnroll = async () => {
    if (!user || !profile || !customTopic.trim()) return;
    setLoading('custom');
    
    try {
      const customProfile = { ...profile, experience: customDifficulty };
      const plan = await generateExtraCourse(customTopic, customProfile);
      
      const courseId = 'custom-' + Date.now();
      const curriculumData = {
        userId: user.uid,
        courseId: courseId,
        title: customTopic,
        days: plan,
        isExtra: true,
        difficulty: customDifficulty,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'curriculums'), curriculumData);
      setEnrolledCourses(prev => ({
        ...prev,
        [courseId]: { id: docRef.id, ...curriculumData }
      }));
      setShowCustomModal(false);
      setCustomTopic('');
      onCourseStarted?.(courseId);
    } catch (error) {
      console.error("Custom enrollment error:", error);
      alert("Failed to generate custom course. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const ongoingCoursesCount = Object.values(enrolledCourses).filter(c => {
    const prog = courseProgress[c.courseId];
    const totalDays = c.days?.length || 7;
    return prog && (prog.completedDays?.length || 0) < totalDays;
  }).length;

  const completedCoursesCount = Object.values(enrolledCourses).filter(c => {
    const prog = courseProgress[c.courseId];
    const totalDays = c.days?.length || 7;
    return prog && (prog.completedDays?.length || 0) >= totalDays;
  }).length;

  const allCourses = [
    ...COURSES,
    ...Object.values(enrolledCourses)
      .filter(enrollment => !COURSES.some(c => c.id === enrollment.courseId))
      .map(enrollment => ({
        id: enrollment.courseId,
        name: enrollment.title,
        icon: Sparkles,
        color: 'text-brand-purple',
        bg: 'bg-brand-purple/10'
      }))
  ];

  const filteredCourses = allCourses.filter(course => {
    const enrollment = enrolledCourses[course.id];
    const prog = courseProgress[course.id];
    const totalDays = enrollment?.days?.length || 7;
    const isCompleted = prog && (prog.completedDays?.length || 0) >= totalDays;
    const isOngoing = enrollment && !isCompleted;

    if (viewState === 'ongoing') return isOngoing;
    if (viewState === 'completed') return isCompleted;
    return true; // 'all'
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight">Extra Courses</h1>
        <p className="text-slate-400">Expand your horizon with intensive 7-day AI-powered specializations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setViewState('all')}
          className={`glass p-6 rounded-3xl flex items-center gap-4 transition-all ${viewState === 'all' ? 'ring-2 ring-brand-purple bg-brand-purple/10' : 'hover:bg-white/5'}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-purple/20 text-brand-purple flex items-center justify-center">
            <Layers size={24} />
          </div>
          <div className="text-left">
            <p className="text-2xl font-black">{allCourses.length}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Available Courses</p>
          </div>
        </button>

        <button 
          onClick={() => setViewState('ongoing')}
          className={`glass p-6 rounded-3xl flex items-center gap-4 transition-all ${viewState === 'ongoing' ? 'ring-2 ring-brand-blue bg-brand-blue/10' : 'hover:bg-white/5'}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 text-brand-blue flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div className="text-left">
            <p className="text-2xl font-black">{ongoingCoursesCount}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ongoing Courses</p>
          </div>
        </button>

        <button 
          onClick={() => setViewState('completed')}
          className={`glass p-6 rounded-3xl flex items-center gap-4 transition-all ${viewState === 'completed' ? 'ring-2 ring-emerald-500 bg-emerald-500/10' : 'hover:bg-white/5'}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div className="text-left">
            <p className="text-2xl font-black">{completedCoursesCount}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completed Courses</p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <p>No courses found in this category.</p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const enrollment = enrolledCourses[course.id];
            const isEnrolled = !!enrollment;
            const isLoading = loading === course.id;
            const progress = courseProgress[course.id];
            const completedCount = progress?.completedDays?.length || 0;
            const totalDays = enrollment?.days?.length || 7;
            const progressPercent = (completedCount / totalDays) * 100;
            const difficulty = selectedDifficulty[course.id] || 'Beginner';

            return (
              <motion.div
                key={course.id}
                whileHover={{ y: -5 }}
                onClick={() => isEnrolled && !isLoading ? onContinueCourse?.(course.id) : null}
                className={`glass p-6 rounded-[2rem] flex flex-col gap-6 group relative overflow-hidden ${isEnrolled ? 'cursor-pointer' : ''}`}
              >
                <div className={`w-14 h-14 rounded-2xl ${course.bg} ${course.color} flex items-center justify-center shadow-lg`}>
                  <course.icon size={28} />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{course.name}</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">7-Day Intensive</p>
                  </div>

                  {!isEnrolled ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Level</label>
                      <div className="flex gap-1">
                        {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                          <button
                            key={level}
                            onClick={() => setSelectedDifficulty(prev => ({ ...prev, [course.id]: level }))}
                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                              difficulty === level 
                                ? 'bg-brand-purple text-white' 
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-brand-purple">{completedCount}/{totalDays} Days</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          className="h-full bg-brand-purple shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                        />
                      </div>
                      <p className="text-[9px] text-slate-500 font-medium">
                        {completedCount === totalDays ? 'Course Completed! 🎉' : `Next: Day ${progress?.currentDay || 1}`}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    isEnrolled ? onContinueCourse?.(course.id) : handleEnroll(course);
                  }}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isEnrolled 
                      ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                      : 'bg-white/5 hover:bg-brand-purple hover:text-white group-hover:neon-glow'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : isEnrolled ? (
                    <><CheckCircle2 size={18} /> Continue Course</>
                  ) : (
                    <><BookOpen size={18} /> Start Course</>
                  )}
                </button>

                {/* Decorative background element */}
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${course.bg} blur-3xl opacity-0 group-hover:opacity-50 transition-opacity`} />
              </motion.div>
            );
          })
        )}
      </div>

      <div className="glass p-8 rounded-[2.5rem] bg-gradient-to-br from-brand-purple/10 to-transparent border-brand-purple/20">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-3xl bg-brand-purple flex items-center justify-center text-white shadow-xl shadow-brand-purple/20">
            <Sparkles size={40} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Don't see what you're looking for?</h3>
            <p className="text-slate-400">Our AI can generate a custom course for any topic you want. Just ask the AI Mentor!</p>
          </div>
          <button 
            onClick={() => setShowCustomModal(true)}
            className="px-8 py-4 glass rounded-2xl font-bold hover:bg-white/10 transition-all"
          >
            Request Custom Topic
          </button>
        </div>
      </div>

      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass w-full max-w-md p-8 rounded-[2rem] space-y-6 relative"
          >
            <button 
              onClick={() => setShowCustomModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Request Custom Course</h2>
              <p className="text-slate-400 text-sm">What would you like to learn? Our AI will generate a 7-day intensive course for you.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Topic</label>
                <input 
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Rust Programming, Quantum Computing..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-purple transition-all"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty Level</label>
                <div className="flex gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setCustomDifficulty(level)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        customDifficulty === level 
                          ? 'bg-brand-purple text-white' 
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleCustomEnroll}
              disabled={!customTopic.trim() || loading === 'custom'}
              className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
            >
              {loading === 'custom' ? (
                <><Loader2 size={20} className="animate-spin" /> Generating Course...</>
              ) : (
                <><Sparkles size={20} /> Generate Course</>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
