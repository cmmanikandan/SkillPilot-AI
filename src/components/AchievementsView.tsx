import React from 'react';
import { motion } from 'framer-motion';
import { Award, Lock } from 'lucide-react';
import { useAuth } from '../lib/useAuth';

const ACHIEVEMENTS = [
  { id: 'first_step', title: 'First Step', description: 'Complete your first day', icon: '🚀', xp: 100 },
  { id: 'streak_5', title: '5-Day Streak', description: 'Maintain a 5-day streak', icon: '🔥', xp: 500 },
  { id: 'quiz_master', title: 'Quiz Master', description: 'Score 100% on a quiz', icon: '🧠', xp: 1000 },
  { id: 'coding_pro', title: 'Coding Pro', description: 'Complete 10 coding challenges', icon: '💻', xp: 2000 },
];

export const AchievementsView: React.FC = () => {
  const { profile } = useAuth();
  const unlockedAchievements = profile?.achievements || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black">Achievements</h1>
        <p className="text-slate-400">Track your progress and unlock rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          return (
            <motion.div
              key={achievement.id}
              className={`glass p-6 rounded-3xl border-2 ${isUnlocked ? 'border-emerald-500/50' : 'border-white/5 opacity-60'}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl">
                  {isUnlocked ? achievement.icon : <Lock className="text-slate-500" size={32} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{achievement.title}</h3>
                  <p className="text-sm text-slate-400">{achievement.description}</p>
                </div>
              </div>
              <div className="text-sm font-bold text-amber-500">+{achievement.xp} XP</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
