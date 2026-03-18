import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Briefcase, 
  Code, 
  Target, 
  Award, 
  Zap, 
  Flame,
  Camera,
  Save,
  Github,
  Twitter,
  Globe,
  Shield
} from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const THEMES = {
  default: 'from-brand-blue/20 to-brand-purple/20',
  emerald: 'from-emerald-400/20 to-teal-600/20',
  sunset: 'from-orange-400/20 to-rose-600/20',
  ocean: 'from-cyan-500/20 to-blue-700/20',
};

const THEME_AVATARS = {
  default: 'from-brand-blue to-brand-purple',
  emerald: 'from-emerald-400 to-teal-600',
  sunset: 'from-orange-400 to-rose-600',
  ocean: 'from-cyan-500 to-blue-700',
};

const AVATARS = {
  default: null,
  robot: '🤖',
  ninja: '🥷',
  wizard: '🧙‍♂️',
};

export const ProfileView: React.FC = () => {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    role: profile?.role || '',
    industry: profile?.industry || '',
    goals: profile?.goals || '',
    github: profile?.github || '',
    twitter: profile?.twitter || '',
    website: profile?.website || ''
  });

  const handleSave = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'progress', user.uid), formData, { merge: true });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const stats = [
    { label: 'Total XP', value: profile?.xp || 0, icon: Zap, color: 'text-brand-purple' },
    { label: 'Level', value: profile?.level || 1, icon: Target, color: 'text-brand-blue' },
    { label: 'Streak', value: profile?.streak || 1, icon: Flame, color: 'text-orange-400' },
    { label: 'Badges', value: profile?.badges?.length || 0, icon: Award, color: 'text-emerald-400' },
  ];

  const activeTheme = profile?.activeTheme || 'default';
  const activeAvatar = profile?.activeAvatar || 'default';
  
  const themeClass = THEMES[activeTheme as keyof typeof THEMES] || THEMES.default;
  const avatarThemeClass = THEME_AVATARS[activeTheme as keyof typeof THEME_AVATARS] || THEME_AVATARS.default;
  const avatarIcon = AVATARS[activeAvatar as keyof typeof AVATARS];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="glass rounded-[3rem] p-8 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-r ${themeClass}`} />
        
        <div className="relative pt-12 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${avatarThemeClass} flex items-center justify-center text-5xl font-black text-white shadow-2xl`}>
              {avatarIcon || profile?.displayName?.[0] || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-brand-purple rounded-xl text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={18} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black mb-2">{profile?.displayName}</h1>
            <p className="text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
              <Briefcase size={16} /> {profile?.role} • {profile?.industry}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
              {profile?.github && <a href={profile.github} target="_blank" className="text-slate-400 hover:text-white"><Github size={20} /></a>}
              {profile?.twitter && <a href={profile.twitter} target="_blank" className="text-slate-400 hover:text-white"><Twitter size={20} /></a>}
              {profile?.website && <a href={profile.website} target="_blank" className="text-slate-400 hover:text-white"><Globe size={20} /></a>}
            </div>
          </div>

          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="px-6 py-3 bg-brand-purple rounded-2xl font-bold neon-glow flex items-center gap-2"
          >
            {isEditing ? <><Save size={20} /> Save Changes</> : <><User size={20} /> Edit Profile</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Info */}
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="glass p-6 rounded-3xl text-center">
                <div className={`w-10 h-10 rounded-xl bg-white/5 mx-auto mb-3 flex items-center justify-center ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="glass p-8 rounded-[2rem] space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Code size={20} className="text-brand-blue" /> Skills & Tech
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.map((skill: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-white/5 rounded-xl text-sm font-medium border border-white/5">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Details & Edit Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-[3rem] space-y-8">
            <h3 className="text-2xl font-bold">About Me</h3>
            
            {isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
                    <input 
                      type="text" 
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-purple transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
                    <input 
                      type="text" 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-purple transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Learning Goals</label>
                  <textarea 
                    value={formData.goals}
                    onChange={(e) => setFormData({...formData, goals: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-32 outline-none focus:border-brand-purple transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">GitHub</label>
                    <input 
                      type="text" 
                      value={formData.github}
                      onChange={(e) => setFormData({...formData, github: e.target.value})}
                      placeholder="https://github.com/..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-purple transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Twitter</label>
                    <input 
                      type="text" 
                      value={formData.twitter}
                      onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                      placeholder="https://twitter.com/..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-purple transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Website</label>
                    <input 
                      type="text" 
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-purple transition-all"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">My Journey</h4>
                  <p className="text-slate-300 leading-relaxed">
                    {profile?.goals || "No goals set yet. Click edit to share what you're working towards!"}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Course Achievements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile?.courseShields && Object.values(profile.courseShields).length > 0 ? (
                      Object.values(profile.courseShields).map((course: any, i: number) => {
                        const shieldColors = {
                          bronze: 'text-amber-500 bg-amber-500/20 border-amber-500/30',
                          silver: 'text-slate-300 bg-slate-300/20 border-slate-300/30',
                          gold: 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
                        };
                        const colorClass = shieldColors[course.shield as keyof typeof shieldColors] || shieldColors.bronze;
                        
                        return (
                          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClass}`}>
                              <Shield size={24} />
                            </div>
                            <div>
                              <p className="font-bold text-sm line-clamp-1">{course.title}</p>
                              <p className="text-xs text-slate-500 capitalize">{course.shield} Shield</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-2 py-8 text-center text-slate-500 italic">
                        No course shields earned yet. Complete 25% of a course to earn your first!
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent Badges</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile?.badges?.length > 0 ? (
                      profile.badges.map((badge: any, i: number) => {
                        const isLegacy = typeof badge === 'string';
                        const name = isLegacy ? badge : badge.name;
                        const date = isLegacy ? 'Recently' : new Date(badge.earnedAt).toLocaleDateString();
                        
                        return (
                          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple">
                              <Award size={24} />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{name}</p>
                              <p className="text-xs text-slate-500">{date}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-2 py-8 text-center text-slate-500 italic">
                        No badges earned yet. Keep learning to unlock them!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
