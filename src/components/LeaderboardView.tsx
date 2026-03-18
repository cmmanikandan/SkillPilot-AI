import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Flame, Loader2 } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, where, documentId } from 'firebase/firestore';
import { db } from '../lib/firebase';

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

export const LeaderboardView: React.FC = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'global' | 'friends'>('global');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const progressQuery = query(collection(db, 'progress'), orderBy('xp', 'desc'), limit(10));
        const progressSnapshot = await getDocs(progressQuery);
        
        const uids = progressSnapshot.docs.map(d => d.id);
        
        let profilesMap: Record<string, any> = {};
        if (uids.length > 0) {
          const profilesQuery = query(collection(db, 'users'), where(documentId(), 'in', uids));
          const profilesSnapshot = await getDocs(profilesQuery);
          profilesSnapshot.docs.forEach(doc => {
            profilesMap[doc.id] = doc.data();
          });
        }

        const leaderData = progressSnapshot.docs.map((docSnap) => {
          const uid = docSnap.id;
          const progressData = docSnap.data();
          const xp = progressData.xp || 0;
          
          const profile = profilesMap[uid];
          const name = profile?.displayName || profile?.name || `Student ${uid.slice(0, 4)}`;
          
          // Dynamic level calculation based on XP (1000 XP per level)
          const calculatedLevel = Math.floor(xp / 1000) + 1;
          const level = Math.max(profile?.level || 1, progressData.level || 1, calculatedLevel);
          
          // Dynamic badge count (mocking some based on XP for now if array is empty)
          let badges = profile?.badges?.length || 0;
          if (badges === 0 && xp >= 1000) badges = 1; // Basic "Achiever" badge mock
          if (badges === 1 && xp >= 5000) badges = 2; // "Master" badge mock
          
          const activeTheme = progressData.activeTheme || 'default';
          const activeAvatar = progressData.activeAvatar || 'default';

          return { uid, name, xp, level, badges, activeTheme, activeAvatar };
        });

        setLeaders(leaderData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [view]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 text-brand-purple animate-spin" />
        <p className="text-slate-400 animate-pulse">Loading global rankings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
            <Trophy size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Leaderboard</h1>
            <p className="text-slate-400">See how you rank against other learners</p>
          </div>
        </div>
        <div className="glass rounded-xl p-1 flex">
          <button 
            onClick={() => setView('global')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'global' ? 'bg-brand-purple text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Global
          </button>
          <button 
            onClick={() => setView('friends')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'friends' ? 'bg-brand-purple text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Friends
          </button>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/5 text-sm font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-5">Student</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-3 text-right">Total XP</div>
        </div>

        <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
          {leaders.map((leader, index) => {
            const isTop3 = index < 3;
            const rankColors = [
              'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', // 1st
              'text-slate-300 bg-slate-300/10 border-slate-300/30', // 2nd
              'text-amber-600 bg-amber-600/10 border-amber-600/30'  // 3rd
            ];
            
            return (
              <motion.div 
                key={leader.uid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`grid grid-cols-12 gap-4 p-6 items-center transition-colors hover:bg-white/5 ${index === 0 ? 'bg-brand-purple/5' : ''}`}
              >
                <div className="col-span-2 flex justify-center">
                  {isTop3 ? (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${rankColors[index]}`}>
                      <Medal size={20} />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 font-bold">
                      #{index + 1}
                    </div>
                  )}
                </div>
                
                <div className="col-span-5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${THEME_AVATARS[leader.activeTheme as keyof typeof THEME_AVATARS] || THEME_AVATARS.default} flex items-center justify-center font-bold text-white shadow-lg text-xl`}>
                    {AVATARS[leader.activeAvatar as keyof typeof AVATARS] || leader.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">{leader.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Star size={12} className="text-amber-500" /> {leader.badges} Badges
                    </p>
                  </div>
                </div>

                <div className="col-span-2 flex justify-center">
                  <div className="px-3 py-1 rounded-full bg-white/5 text-sm font-bold text-brand-purple border border-white/10">
                    Lvl {leader.level}
                  </div>
                </div>

                <div className="col-span-3 flex justify-end items-center gap-2">
                  <span className="font-mono font-bold text-lg text-emerald-400">{leader.xp.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">XP</span>
                </div>
              </motion.div>
            );
          })}

          {leaders.length === 0 && (
            <div className="p-12 text-center text-slate-500 italic">
              No learners found. Be the first to earn XP!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
