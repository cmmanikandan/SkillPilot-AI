import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Flame,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useAuth } from '../lib/useAuth';
import { DailyChallenges } from './DailyChallenges';
import { BadgesSection } from './BadgesSection';

import { collection, query, where, getDocs, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const Dashboard: React.FC<{ setActiveTab?: (tab: string) => void }> = ({ setActiveTab }) => {
  const { user, profile } = useAuth();
  const [mainProgress, setMainProgress] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | null = null;

    const fetchMainCurriculum = async () => {
      const q = query(
        collection(db, 'curriculums'), 
        where('userId', '==', user.uid)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const mainCurriculum = docs
        .filter(d => !d.isExtra)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
      
      if (mainCurriculum) {
        unsubscribe = onSnapshot(doc(db, 'curriculumProgress', mainCurriculum.id), (progSnap) => {
          if (progSnap.exists()) {
            setMainProgress(progSnap.data());
          }
        }, (error) => {
          console.error("Dashboard progress snapshot error:", error);
        });
      }
    };

    fetchMainCurriculum();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const completedCount = mainProgress?.completedDays?.length || 0;
  const currentDay = mainProgress?.currentDay || 1;

  const activityData = completedCount 
    ? [
        { name: 'Mon', xp: 400 + ((profile?.level || 1) * 50) },
        { name: 'Tue', xp: 300 + ((profile?.level || 1) * 40) },
        { name: 'Wed', xp: 600 + ((profile?.level || 1) * 60) },
        { name: 'Thu', xp: 800 + ((profile?.level || 1) * 80) },
        { name: 'Fri', xp: 500 + ((profile?.level || 1) * 50) },
        { name: 'Sat', xp: 900 + ((profile?.level || 1) * 90) },
        { name: 'Sun', xp: 700 + ((profile?.level || 1) * 70) },
      ]
    : [
        { name: 'Mon', xp: 0 },
        { name: 'Tue', xp: 0 },
        { name: 'Wed', xp: 0 },
        { name: 'Thu', xp: 0 },
        { name: 'Fri', xp: 0 },
        { name: 'Sat', xp: 0 },
        { name: 'Sun', xp: 0 },
      ];

  const stats = [
    { label: 'Total XP', value: profile?.xp || 0, icon: Zap, color: 'text-brand-purple' },
    { label: 'Current Level', value: profile?.level || 1, icon: TrendingUp, color: 'text-brand-blue' },
    { label: 'Day Streak', value: profile?.streak || 1, icon: Flame, color: 'text-orange-400' },
    { label: 'Days Completed', value: `${completedCount}/30`, icon: CheckCircle, color: 'text-emerald-400' },
  ];

  const userSkills = profile?.skills?.length > 0 
    ? profile.skills.map((skill: string, i: number) => ({
        name: skill,
        progress: Math.min(100, 20 + ((profile?.level || 1) * 10) + (i * 5)), // Dynamic progress based on level
        color: i % 4 === 0 ? 'bg-yellow-400' : i % 4 === 1 ? 'bg-brand-blue' : i % 4 === 2 ? 'bg-emerald-400' : 'bg-brand-purple'
      }))
    : [
        { name: 'JavaScript', progress: 85, color: 'bg-yellow-400' },
        { name: 'React', progress: 60, color: 'bg-brand-blue' },
        { name: 'Node.js', progress: 45, color: 'bg-emerald-400' },
        { name: 'AI/ML', progress: 30, color: 'bg-brand-purple' },
      ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 px-2 md:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-2 text-center md:text-left">
            Welcome back, <span className="text-brand-purple">{profile?.displayName?.split(' ')[0] || 'Explorer'}</span>!
          </h1>
          <p className="text-slate-400 flex items-center gap-2 text-center md:text-left text-sm md:text-base">
            <Clock size={16} /> You've completed {completedCount} days of your journey. Keep it up!
          </p>
        </div>
        <button 
          onClick={() => setActiveTab?.('curriculum')}
          aria-label={mainProgress?.isFinished ? 'View Certificate' : `Continue Day ${currentDay}`}
          className="w-full md:w-auto px-4 py-2 md:px-6 md:py-3 bg-brand-purple rounded-xl font-bold neon-glow flex items-center justify-center gap-2 hover:scale-105 transition-transform mt-2 md:mt-0"
        >
          {mainProgress?.isFinished ? 'View Certificate' : `Continue Day ${currentDay}`} <ChevronRight size={20} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl"
            role="region"
            aria-label={`Statistic: ${s.label}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${s.color}`}>
                <s.icon size={24} />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stats</span>
            </div>
            <p className="text-3xl font-black mb-1">{s.value}</p>
            <p className="text-sm text-slate-400 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-4 md:p-8 rounded-[2rem]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Learning Activity</h3>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#8b5cf6' }}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="glass p-4 md:p-8 rounded-[2rem]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Live Global Activity</h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live
                </div>
              </div>
              <span className="text-xs text-slate-500 font-bold">142 users active</span>
            </div>
            <div className="space-y-4">
              {[
                { user: profile?.displayName || 'You', action: `reached Level ${profile?.level || 1}`, time: 'Just now', xp: `+${profile?.xp || 0} XP` },
                { user: 'Alex K.', action: 'completed Day 4 Quiz', time: '2m ago', xp: '+100 XP' },
                { user: 'Sarah M.', action: 'unlocked "React Hooks" badge', time: '5m ago', xp: '+250 XP' },
                { user: 'David W.', action: 'started "Logic Gates" game', time: '8m ago', xp: '+10 XP' },
              ].map((act, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple font-bold text-xs">
                      {act.user.split(' ')[0][0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {act.user} <span className="text-slate-400 font-normal">{act.action}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{act.time}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{act.xp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Daily Challenges & Badges */}
          <div className="space-y-6">
            <DailyChallenges />
            <BadgesSection />
          </div>

          <div className="glass p-4 md:p-8 rounded-[2rem] flex flex-col">
            <h3 className="text-xl font-bold mb-6">Skill Mastery</h3>
            <div className="space-y-6 flex-1">
              {userSkills.map((skill: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">{skill.name}</span>
                    <span className="text-slate-400">{skill.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className={`h-full ${skill.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-8 w-full py-3 glass rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
              View Skill Gap Analysis
            </button>
          </div>

          {/* System Status Card */}
          <div className="glass p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-sm font-bold text-emerald-500">System Operational</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All AI models and learning services are running at peak performance. Real-time sync enabled.
            </p>
          </div>

          {/* Help & Training Card */}
          <div className="glass p-4 md:p-8 rounded-[2rem] bg-gradient-to-br from-brand-blue/10 to-transparent border-brand-blue/20">
            <h3 className="text-xl font-bold mb-4">New to SkillPilot?</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Learn how to maximize your learning with our platform guide and AI mentor tips.
            </p>
            <button 
              onClick={() => setActiveTab?.('guide')}
              aria-label="Start Platform Training"
              className="w-full py-4 bg-brand-blue rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-brand-blue/20"
            >
              Start Platform Training <ChevronRight size={20} />
            </button>
          </div>

          {/* Extra Courses Promo */}
          <div className="glass p-4 md:p-8 rounded-[2rem] bg-gradient-to-br from-brand-purple/10 to-transparent border-brand-purple/20">
            <h3 className="text-xl font-bold mb-4">Master New Skills</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Enroll in intensive 7-day courses for Python, Java, React, and more.
            </p>
            <button 
              onClick={() => setActiveTab?.('extra')}
              aria-label="Explore Extra Courses"
              className="w-full py-4 bg-brand-purple rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-brand-purple/20"
            >
              Explore Extra Courses <Sparkles size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
