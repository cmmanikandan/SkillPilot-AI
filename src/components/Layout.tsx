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
  const [showMobileNav, setShowMobileNav] = React.useState(false);

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
        className="glass border-r border-white/10 flex flex-col z-50 hidden md:flex overflow-y-auto scrollbar-thin scrollbar-thumb-brand-purple/40 scrollbar-track-transparent"
        style={{ minWidth: isCollapsed ? 80 : 260, maxWidth: isCollapsed ? 80 : 260 }}
      >
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 font-bold text-xl bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent"
              >
                <Zap className="text-brand-purple fill-brand-purple" size={24} />
                SkillPilot AI
              </motion.div>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
              aria-label={isCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider animate-pulse border border-emerald-500/20">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                Live Session
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                v2.4.0
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                (activeTab === item.id || (item.id === 'extra' && activeTab.startsWith('extra-course-')))
                  ? "bg-brand-purple/20 text-white neon-border" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={22} className={cn(activeTab === item.id && "text-brand-purple")} />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-brand-purple rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          {!isCollapsed && profile && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center font-bold text-white shadow-lg">
                {profile.displayName?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{profile?.displayName || 'Explorer'}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>Level {profile?.level || 1}</span>
                  <span>{profile?.xpProgress || 0} / {profile?.xpRequired || 250} XP</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((profile?.xpProgress || 0) / (profile?.xpRequired || 250)) * 100}%` }}
                    className="h-full bg-brand-purple"
                  />
                </div>
              </div>
            </div>
          )}
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={22} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
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

        {/* Bottom Navigation for Mobile with open/hide icon */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-brand-dark border-t border-white/10 flex justify-between items-center h-16 md:hidden px-2">
          <button
            className="flex flex-col items-center justify-center py-2 text-slate-400"
            onClick={() => setShowMobileNav(true)}
            aria-label="Open navigation menu"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            <span className="text-xs">Menu</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center py-2 ${activeTab === 'dashboard' ? 'text-brand-purple' : 'text-slate-400'}`}
            onClick={() => setActiveTab('dashboard')}
            aria-label="Dashboard"
          >
            <LayoutDashboard size={24} />
            <span className="text-xs">Dashboard</span>
          </button>
        </nav>

        {/* Mobile Nav Modal */}
        {showMobileNav && (
          <div className="fixed inset-0 z-[100] bg-black/70 flex flex-col md:hidden">
            <div className="flex justify-end p-4">
              <button
                className="text-white bg-brand-dark rounded-full p-2"
                onClick={() => setShowMobileNav(false)}
                aria-label="Close navigation menu"
              >
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <nav className="flex-1 flex flex-col items-center justify-center gap-6">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setShowMobileNav(false); }}
                  className={`flex flex-col items-center justify-center py-4 w-40 rounded-xl text-lg font-bold ${activeTab === item.id ? 'text-brand-purple bg-white/10' : 'text-white bg-white/5 hover:bg-white/10'}`}
                >
                  <item.icon size={32} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </main>
    </div>
  );
};
