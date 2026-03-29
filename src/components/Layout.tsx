import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Code2, 
  MessageSquare, 
  Trophy, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Gamepad2,
  User,
  HelpCircle,
  Sparkles,
  ShoppingBag,
  Award,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { auth } from '../lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LevelUpCelebration = ({ level, onClose }: { level: number, onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass max-w-md w-full p-10 rounded-[3rem] text-center space-y-6 border-4 border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-black relative overflow-hidden"
    >
      <div className="relative z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-32 h-32 mx-auto rounded-full bg-black/40 flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/10 mb-6"
        >
          <TrendingUp size={64} className="text-amber-500" />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-black mb-4 tracking-tight text-white">Level Up!</h2>
          <p className="text-lg text-white/90">Congratulations! You've reached Level {level}. Keep up the great work!</p>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onClose}
          className="w-full py-4 rounded-2xl font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors mt-8"
        >
          Awesome!
        </motion.button>
      </div>
    </motion.div>
  </div>
);

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { profile, levelUp, clearLevelUp } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
    { id: 'extra', label: 'Extra Courses', icon: Sparkles },
    { id: 'coding', label: 'Coding Lab', icon: Code2 },
    { id: 'mentor', label: 'AI Mentor', icon: MessageSquare },
    { id: 'games', label: 'Tech Games', icon: Gamepad2 },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'store', label: 'Reward Store', icon: ShoppingBag },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {levelUp && <LevelUpCelebration level={levelUp} onClose={clearLevelUp} />}
      {/* Sidebar: hidden on mobile */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? '80px' : '260px' }}
        className="glass border-r border-white/10 flex flex-col z-50 hidden md:flex"
      >
        {/* ...existing code... */}
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative w-full max-w-full">
        {/* Live Ticker */}
        <div className="bg-brand-purple/10 border-b border-white/5 py-2 px-4 md:px-8 overflow-hidden whitespace-nowrap">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-6 md:gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"
          >
            {/* ...existing code... */}
          </motion.div>
        </div>

        <div className="max-w-full md:max-w-7xl mx-auto p-2 sm:p-4 md:p-8">
          {children}
        </div>

        {/* Bottom Navigation for Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-brand-dark border-t border-white/10 flex justify-around items-center h-16 md:hidden">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 ${activeTab === item.id ? 'text-brand-purple' : 'text-slate-400'}`}
            >
              <item.icon size={24} />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};
