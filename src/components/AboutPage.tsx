import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Rocket, Users, Target } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-6xl mx-auto px-6 space-y-24 pb-24">
        {/* Hero */}
        <div className="text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter"
          >
            OUR <span className="text-brand-purple">MISSION</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            SkillPilot AI is dedicated to democratizing high-quality education through personalized, AI-driven learning paths.
          </motion.p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Brain, title: "AI-First", desc: "We leverage the latest in generative AI to create truly personalized learning experiences." },
            { icon: Rocket, title: "Fast-Track", desc: "Our curriculum is optimized for speed and retention, helping you master skills in record time." },
            { icon: Users, title: "Community", desc: "Learning is better together. We foster a global community of ambitious learners." }
          ].map((v, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-[2rem] border border-white/10"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-purple/20 flex items-center justify-center text-brand-purple mb-6">
                <v.icon size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{v.title}</h3>
              <p className="text-slate-400 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">The SkillPilot Story</h2>
            <p className="text-slate-400 leading-relaxed">
              Founded in 2024, SkillPilot AI started with a simple question: "Why is learning still one-size-fits-all?" 
              We saw millions of people struggling with rigid courses that didn't adapt to their unique backgrounds, 
              goals, or learning styles.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Today, we're proud to support thousands of students worldwide, from aspiring developers to 
              seasoned professionals looking to pivot into AI and machine learning.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[3rem] overflow-hidden glass border border-white/10">
              <img 
                src="https://picsum.photos/seed/about/800/800" 
                alt="SkillPilot Team" 
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 glass p-8 rounded-3xl border border-brand-purple/20">
              <p className="text-4xl font-black text-brand-purple">10k+</p>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Active Learners</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
