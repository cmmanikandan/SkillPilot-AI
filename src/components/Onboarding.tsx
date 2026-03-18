import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Target, 
  ArrowRight, 
  CheckCircle2,
  Code,
  Globe,
  Database,
  Cpu,
  Zap
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';

export const Onboarding: React.FC<{ onComplete?: () => void, onCancel?: () => void }> = ({ onComplete, onCancel }) => {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    displayName: profile?.displayName || '',
    role: profile?.role || '',
    skills: profile?.skills || [] as string[],
    experience: profile?.experience || '',
    industry: profile?.industry || '',
    goals: profile?.goals || ''
  });

  const roles = [
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'hobbyist', label: 'Hobbyist', icon: User }
  ];

  const skillOptions = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'Cloud', 'AI/ML', 'UI/UX', 'DevOps'];
  
  const experienceLevels = [
    { id: 'beginner', label: 'Beginner', desc: 'Just starting out' },
    { id: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
    { id: 'advanced', label: 'Advanced', desc: 'Experienced pro' }
  ];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!user) return;
    
    // Create user profile
    await setDoc(doc(db, 'users', user.uid), {
      ...data,
      uid: user.uid,
      email: user.email,
      displayName: data.displayName || user.displayName || user.email?.split('@')[0] || 'Explorer',
      onboardingComplete: true,
      lastActive: new Date().toISOString()
    }, { merge: true });

    // Initialize progress only if it doesn't exist
    const progressRef = doc(db, 'progress', user.uid);
    await setDoc(progressRef, {
      lastActive: new Date().toISOString()
    }, { merge: true });

    if (onComplete) {
      onComplete();
    }
  };

  const toggleSkill = (skill: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full relative">
        {onCancel && (
          <button 
            onClick={onCancel}
            className="absolute -top-12 right-0 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-sm text-slate-500 mb-2">
            <span>Step {step} of 6</span>
            <span>{Math.round((step / 6) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-brand-purple"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">What should we call you?</h2>
                <p className="text-slate-400">Enter your real name to personalize your certificates.</p>
              </div>
              <div className="space-y-4 max-w-md mx-auto">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    type="text"
                    value={data.displayName}
                    onChange={(e) => setData({ ...data, displayName: e.target.value })}
                    placeholder="Your Full Name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-purple transition-all"
                  />
                </div>
                <button 
                  disabled={!data.displayName}
                  onClick={handleNext}
                  className="w-full py-4 bg-brand-purple rounded-2xl font-bold text-lg neon-glow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Next <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">What's your current role?</h2>
                <p className="text-slate-400">Help us tailor your learning experience.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {roles.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setData({ ...data, role: r.id }); handleNext(); }}
                    className={`p-8 rounded-3xl glass glass-hover border-2 transition-all ${data.role === r.id ? 'border-brand-purple bg-brand-purple/10' : 'border-transparent'}`}
                  >
                    <r.icon size={32} className="mx-auto mb-4 text-brand-purple" />
                    <span className="font-bold">{r.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">What are you interested in?</h2>
                <p className="text-slate-400">Select the skills you want to master.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {skillOptions.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-6 py-3 rounded-full border transition-all ${data.skills.includes(skill) ? 'bg-brand-purple border-brand-purple text-white' : 'glass border-white/10 text-slate-400 hover:border-white/30'}`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              <div className="flex justify-center pt-8">
                <button 
                  disabled={data.skills.length === 0}
                  onClick={handleNext}
                  className="px-8 py-3 bg-brand-purple rounded-xl font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Experience Level</h2>
                <p className="text-slate-400">Where are you on your journey?</p>
              </div>
              <div className="space-y-4">
                {experienceLevels.map(lvl => (
                  <button
                    key={lvl.id}
                    onClick={() => { setData({ ...data, experience: lvl.id }); handleNext(); }}
                    className={`w-full p-6 rounded-2xl glass glass-hover border-2 text-left transition-all ${data.experience === lvl.id ? 'border-brand-purple bg-brand-purple/10' : 'border-transparent'}`}
                  >
                    <h4 className="font-bold text-lg">{lvl.label}</h4>
                    <p className="text-slate-400 text-sm">{lvl.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">One last thing...</h2>
                <p className="text-slate-400">What are your main learning goals?</p>
              </div>
              <textarea
                value={data.goals}
                onChange={(e) => setData({ ...data, goals: e.target.value })}
                placeholder="e.g. I want to become a full-stack developer and build AI apps."
                className="w-full h-40 p-6 rounded-3xl glass border-white/10 focus:border-brand-purple outline-none resize-none transition-all"
              />
              <div className="flex justify-center pt-4">
                <button 
                  disabled={!data.goals}
                  onClick={handleSubmit}
                  className="px-12 py-4 bg-brand-purple rounded-2xl font-bold text-lg neon-glow flex items-center gap-2"
                >
                  Launch My Journey <Zap size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
