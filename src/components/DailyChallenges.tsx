import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';

export const DailyChallenges: React.FC = () => {
  const { user, profile } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    // Mock daily challenges for now
    setChallenges([
      { id: 1, title: 'Complete 1 Quiz', xp: 100, completed: false },
      { id: 2, title: 'Visit 3 Resources', xp: 50, completed: false },
      { id: 3, title: 'Write 10 lines of code', xp: 150, completed: false },
    ]);
  }, []);

  return (
    <div className="glass p-8 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="text-brand-purple" /> Daily Challenges
        </h2>
        <span className="text-sm text-slate-400 flex items-center gap-1">
          <Clock size={16} /> Resets in 4h 12m
        </span>
      </div>
      <div className="space-y-4">
        {challenges.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.completed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-brand-purple/20 text-brand-purple'}`}>
                {c.completed ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
              </div>
              <div>
                <p className="font-bold">{c.title}</p>
                <p className="text-sm text-slate-500">+{c.xp} XP</p>
              </div>
            </div>
            <button className={`px-4 py-2 rounded-xl font-bold text-sm ${c.completed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/10 hover:bg-white/20'}`}>
              {c.completed ? 'Done' : 'Start'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
