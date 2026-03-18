import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, Sparkles, Code2, BookOpen, Trophy, Mail, Lock, User, Github, Chrome, AlertCircle, Loader2, X, ChevronLeft } from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AboutPage } from './AboutPage';
import { ContactPage } from './ContactPage';

export const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'contact'>('home');

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else if (authMode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await sendPasswordResetEmail(auth, email);
        setMessage('Password reset email sent! Check your inbox.');
        setTimeout(() => setAuthMode('signin'), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: "AI Curriculum",
      desc: "Personalized 30-day learning paths generated specifically for your goals.",
      icon: BookOpen,
      color: "text-blue-400"
    },
    {
      title: "Intelligent Mentor",
      desc: "24/7 AI assistance to explain concepts, debug code, and guide your journey.",
      icon: Sparkles,
      color: "text-purple-400"
    },
    {
      title: "Coding Lab",
      desc: "Built-in compiler and debugger with real-time AI feedback on your code.",
      icon: Code2,
      color: "text-emerald-400"
    },
    {
      title: "Gamified Growth",
      desc: "Earn XP, level up, and collect badges as you master new skills.",
      icon: Trophy,
      color: "text-amber-400"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050505] text-white">
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-brand-purple fill-brand-purple" size={32} />
                </div>
                <h2 className="text-3xl font-black tracking-tight">
                  {authMode === 'signin' ? 'Welcome Back' : authMode === 'signup' ? 'Join SkillPilot' : 'Reset Password'}
                </h2>
                <p className="text-slate-400 mt-2">
                  {authMode === 'signin' ? 'Continue your learning journey' : authMode === 'signup' ? 'Start your 30-day mastery path' : 'Enter your email to get a reset link'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm">
                  <Sparkles size={18} />
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-purple transition-all"
                    />
                  </div>
                </div>

                {authMode !== 'forgot' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-purple transition-all"
                      />
                    </div>
                  </div>
                )}

                {authMode === 'signin' && (
                  <button 
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-sm text-brand-purple font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                )}

                <button 
                  disabled={loading}
                  className="w-full py-4 bg-brand-purple rounded-2xl font-bold text-lg neon-glow flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (authMode === 'signin' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Send Reset Link')}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0a0a0a] px-4 text-slate-500 font-bold tracking-widest">Or continue with</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                className="w-full py-4 glass rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
              >
                <Chrome size={20} /> Google
              </button>

              <p className="text-center mt-8 text-slate-400 text-sm">
                {authMode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="ml-2 text-brand-purple font-bold hover:underline"
                >
                  {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[50] glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 font-bold text-2xl cursor-pointer"
          >
            <Zap className="text-brand-purple fill-brand-purple" />
            <span>SkillPilot AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-widest text-slate-400">
            <button 
              onClick={() => setCurrentView('home')}
              className={`hover:text-white transition-colors ${currentView === 'home' ? 'text-white' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentView('about')}
              className={`hover:text-white transition-colors ${currentView === 'about' ? 'text-white' : ''}`}
            >
              About
            </button>
            <button 
              onClick={() => setCurrentView('contact')}
              className={`hover:text-white transition-colors ${currentView === 'contact' ? 'text-white' : ''}`}
            >
              Contact
            </button>
          </div>
          <button 
            onClick={() => {
              setAuthMode('signin');
              setShowAuthModal(true);
            }}
            className="bg-brand-purple px-6 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-brand-purple/20"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.main 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-6 pt-40 pb-32 relative z-10"
          >
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="px-4 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-sm font-semibold mb-6 inline-block">
                  Next-Gen Learning Platform
                </span>
                <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-tight">
                  Your AI-Powered <br />
                  <span className="bg-gradient-to-r from-brand-blue via-brand-purple to-pink-500 bg-clip-text text-transparent">
                    Learning Copilot
                  </span>
                </h1>
                <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Master any skill with personalized curricula, real-time AI mentoring, and a gamified experience designed for modern learners.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="px-8 py-4 bg-brand-purple rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform neon-glow"
                  >
                    Get Started for Free <ArrowRight size={20} />
                  </button>
                  <button className="px-8 py-4 glass rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
                    View Demo
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-8 rounded-3xl glass-hover border border-white/5"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${f.color}`}>
                    <f.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.main>
        )}

        {currentView === 'about' && (
          <motion.div 
            key="about"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AboutPage />
          </motion.div>
        )}

        {currentView === 'contact' && (
          <motion.div 
            key="contact"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ContactPage />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-purple/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-blue/20 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};
