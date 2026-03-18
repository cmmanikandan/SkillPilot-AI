import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/useAuth';

export const SkillGapView: React.FC = () => {
  const { profile } = useAuth();
  
  const gaps = [
    { skill: 'React Hooks', urgency: 'High', suggestion: 'Practice useEffect and custom hooks' },
    { skill: 'TypeScript Generics', urgency: 'Medium', suggestion: 'Read documentation on advanced types' },
    { skill: 'Firebase Security Rules', urgency: 'High', suggestion: 'Review security rule best practices' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-6 mb-12">
        <div className="w-20 h-20 rounded-3xl bg-brand-purple/20 flex items-center justify-center text-brand-purple border border-brand-purple/20">
          <Brain size={40} />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Skill Gap Analysis</h1>
          <p className="text-slate-400 text-lg">AI-powered insights to accelerate your learning journey.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {gaps.map((gap, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 rounded-3xl flex items-center justify-between border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl ${gap.urgency === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">{gap.skill}</h3>
                <p className="text-slate-400">{gap.suggestion}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${gap.urgency === 'High' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
              {gap.urgency} Priority
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
