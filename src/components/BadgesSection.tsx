import React from 'react';
import { motion } from 'framer-motion';
import { Award, Lock } from 'lucide-react';
import { useAuth } from '../lib/useAuth';

export const BadgesSection: React.FC = () => {
  const { profile } = useAuth();
  const badges = [
    { id: 1, name: '7-Day Streak', icon: Award, earned: false },
    { id: 2, name: 'Quiz Ace', icon: Award, earned: true },
    { id: 3, name: 'Capstone Conqueror', icon: Award, earned: false },
  ];

  return (
    <div className="glass p-8 rounded-3xl">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Award className="text-amber-500" /> Badges
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {badges.map((b) => (
          <div key={b.id} className={`p-4 rounded-2xl border ${b.earned ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${b.earned ? 'bg-amber-500/20 text-amber-500' : 'bg-white/10 text-slate-500'}`}>
              {b.earned ? <b.icon size={24} /> : <Lock size={24} />}
            </div>
            <p className="text-xs font-bold text-center">{b.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
