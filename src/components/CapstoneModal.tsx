import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, RefreshCw, Briefcase, CheckCircle2, Star } from 'lucide-react';
import { generateCapstone } from '../lib/gemini';

interface CapstoneModalProps {
  courseTitle: string;
  onClose: () => void;
}

export const CapstoneModal: React.FC<CapstoneModalProps> = ({ courseTitle, onClose }) => {
  const [capstone, setCapstone] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCapstone();
  }, [courseTitle]);

  const loadCapstone = async () => {
    setLoading(true);
    try {
      const data = await generateCapstone(courseTitle);
      if (data) {
        setCapstone(data);
      }
    } catch (error) {
      console.error("Error generating capstone:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-3xl w-full relative max-h-[90vh] overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Briefcase size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Capstone Project</h2>
            <p className="text-slate-400">Apply your knowledge from {courseTitle}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-slate-400 animate-pulse">Designing your real-world project...</p>
          </div>
        ) : capstone ? (
          <div className="space-y-8">
            <div className="glass p-6 rounded-2xl border border-white/5">
              <h3 className="text-2xl font-bold text-white mb-2">{capstone.title}</h3>
              <p className="text-slate-300 leading-relaxed">{capstone.description}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} /> Core Requirements
              </h4>
              <ul className="space-y-3">
                {capstone.requirements.map((req: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 bg-white/5 p-4 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Star size={16} className="text-amber-500" /> Bonus Challenges
              </h4>
              <ul className="space-y-3">
                {capstone.bonusChallenges.map((challenge: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end">
              <button onClick={onClose} className="px-8 py-4 bg-emerald-500 text-black rounded-2xl font-bold neon-glow hover:scale-[1.02] transition-transform">
                I accept the challenge
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-red-400 mb-4">Failed to load capstone project.</p>
            <button onClick={loadCapstone} className="px-6 py-3 bg-white/10 rounded-xl flex items-center gap-2 mx-auto">
              <RefreshCw size={18} /> Try Again
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
