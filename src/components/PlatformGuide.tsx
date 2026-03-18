import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Code2, 
  MessageSquare, 
  Gamepad2, 
  Trophy, 
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const PlatformGuide: React.FC = () => {
  const steps = [
    {
      title: 'Personalized Curriculum',
      description: 'Our AI analyzes your industry and goals to generate a 30-day learning path tailored specifically for you.',
      icon: BookOpen,
      color: 'text-brand-blue',
      bg: 'bg-brand-blue/10'
    },
    {
      title: 'Interactive Coding Lab',
      description: 'Practice what you learn in a real-time coding environment with instant feedback and AI assistance.',
      icon: Code2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      title: 'AI Mentor Support',
      description: 'Stuck on a concept? Your AI Mentor is available 24/7 to explain complex topics and guide you through challenges.',
      icon: MessageSquare,
      color: 'text-brand-purple',
      bg: 'bg-brand-purple/10'
    },
    {
      title: 'Skill Games',
      description: 'Take a break and sharpen your developer reflexes with mini-games designed to improve logic and speed.',
      icon: Gamepad2,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tight">How SkillPilot Works</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Your journey to mastering new technologies, guided by artificial intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 rounded-[2.5rem] space-y-6 hover:scale-[1.02] transition-transform cursor-default"
          >
            <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center ${step.color}`}>
              <step.icon size={32} />
            </div>
            <h3 className="text-2xl font-bold">{step.title}</h3>
            <p className="text-slate-400 leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="glass p-10 rounded-[3rem] bg-gradient-to-br from-brand-purple/10 to-transparent border-brand-purple/20">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-black">Ready to level up?</h2>
            <div className="space-y-4">
              {[
                'Complete daily tasks to earn XP',
                'Pass quizzes to unlock the next day',
                'Earn unique badges for your profile',
                'Climb the global leaderboard'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-auto">
            <div className="glass p-8 rounded-3xl bg-black/40 border-white/5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold">
                  <Zap size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pro Tip</p>
                  <p className="font-bold">Consistency is Key</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Users who complete at least 15 minutes of learning daily are 3x more likely to reach their goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
