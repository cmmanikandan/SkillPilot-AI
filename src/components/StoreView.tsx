import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Zap, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const THEMES = [
  { id: 'default', name: 'Cosmic Purple', cost: 0, color: 'from-brand-blue to-brand-purple' },
  { id: 'emerald', name: 'Emerald City', cost: 500, color: 'from-emerald-400 to-teal-600' },
  { id: 'sunset', name: 'Sunset Orange', cost: 1000, color: 'from-orange-400 to-rose-600' },
  { id: 'ocean', name: 'Deep Ocean', cost: 2000, color: 'from-cyan-500 to-blue-700' },
];

const AVATARS = [
  { id: 'default', name: 'Initials', cost: 0, icon: 'U' },
  { id: 'robot', name: 'AI Robot', cost: 300, icon: '🤖' },
  { id: 'ninja', name: 'Code Ninja', cost: 800, icon: '🥷' },
  { id: 'wizard', name: 'Tech Wizard', cost: 1500, icon: '🧙‍♂️' },
];

export const StoreView: React.FC = () => {
  const { user, profile } = useAuth();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (type: 'theme' | 'avatar', item: any) => {
    if (!user || !profile) return;
    if (profile.xp < item.cost) return;

    setPurchasing(item.id);

    try {
      const newXp = profile.xp - item.cost;
      const unlocks = profile.unlocks || {};
      
      if (!unlocks[type]) unlocks[type] = ['default'];
      if (!unlocks[type].includes(item.id)) unlocks[type].push(item.id);

      await setDoc(doc(db, 'progress', user.uid), {
        xp: newXp,
        unlocks,
        [`active${type.charAt(0).toUpperCase() + type.slice(1)}`]: item.id
      }, { merge: true });
    } catch (error) {
      console.error("Error purchasing item:", error);
    } finally {
      setPurchasing(null);
    }
  };

  const handleEquip = async (type: 'theme' | 'avatar', id: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'progress', user.uid), {
        [`active${type.charAt(0).toUpperCase() + type.slice(1)}`]: id
      }, { merge: true });
    } catch (error) {
      console.error("Error equipping item:", error);
    }
  };

  const hasUnlocked = (type: 'theme' | 'avatar', id: string) => {
    if (id === 'default') return true;
    return profile?.unlocks?.[type]?.includes(id) || false;
  };

  const isEquipped = (type: 'theme' | 'avatar', id: string) => {
    const active = profile?.[`active${type.charAt(0).toUpperCase() + type.slice(1)}`] || 'default';
    return active === id;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-brand-purple/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-brand-purple" />
        </div>
        <h1 className="text-5xl font-black tracking-tight">Reward Store</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Spend your hard-earned XP to customize your profile and stand out on the leaderboard.
        </p>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/10 mt-4">
          <span className="text-slate-400">Your Balance:</span>
          <span className="text-2xl font-black text-brand-purple flex items-center gap-1">
            <Zap size={24} /> {profile?.xp || 0}
          </span>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue">
            🎨
          </span>
          Profile Themes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {THEMES.map(theme => {
            const unlocked = hasUnlocked('theme', theme.id);
            const equipped = isEquipped('theme', theme.id);
            const canAfford = (profile?.xp || 0) >= theme.cost;

            return (
              <motion.div
                key={theme.id}
                whileHover={{ y: -5 }}
                className={`glass p-6 rounded-3xl border-2 transition-all ${equipped ? 'border-brand-purple bg-brand-purple/5' : 'border-white/5'}`}
              >
                <div className={`w-full h-24 rounded-2xl bg-gradient-to-br ${theme.color} mb-6 shadow-lg`} />
                <h3 className="text-xl font-bold mb-2">{theme.name}</h3>
                
                <div className="mt-6">
                  {equipped ? (
                    <button disabled className="w-full py-3 rounded-xl font-bold bg-white/10 text-white flex items-center justify-center gap-2">
                      <CheckCircle size={18} /> Equipped
                    </button>
                  ) : unlocked ? (
                    <button 
                      onClick={() => handleEquip('theme', theme.id)}
                      className="w-full py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                      Equip Theme
                    </button>
                  ) : (
                    <button 
                      onClick={() => handlePurchase('theme', theme)}
                      disabled={!canAfford || purchasing === theme.id}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canAfford ? 'bg-brand-purple hover:bg-brand-purple/80 text-white neon-glow' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
                    >
                      {purchasing === theme.id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : canAfford ? (
                        <><Zap size={18} /> {theme.cost} XP</>
                      ) : (
                        <><Lock size={18} /> {theme.cost} XP</>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
            👤
          </span>
          Avatars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {AVATARS.map(avatar => {
            const unlocked = hasUnlocked('avatar', avatar.id);
            const equipped = isEquipped('avatar', avatar.id);
            const canAfford = (profile?.xp || 0) >= avatar.cost;

            return (
              <motion.div
                key={avatar.id}
                whileHover={{ y: -5 }}
                className={`glass p-6 rounded-3xl border-2 transition-all text-center ${equipped ? 'border-brand-purple bg-brand-purple/5' : 'border-white/5'}`}
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-white/5 flex items-center justify-center text-4xl mb-6 shadow-inner">
                  {avatar.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{avatar.name}</h3>
                
                <div className="mt-6">
                  {equipped ? (
                    <button disabled className="w-full py-3 rounded-xl font-bold bg-white/10 text-white flex items-center justify-center gap-2">
                      <CheckCircle size={18} /> Equipped
                    </button>
                  ) : unlocked ? (
                    <button 
                      onClick={() => handleEquip('avatar', avatar.id)}
                      className="w-full py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                      Equip Avatar
                    </button>
                  ) : (
                    <button 
                      onClick={() => handlePurchase('avatar', avatar)}
                      disabled={!canAfford || purchasing === avatar.id}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canAfford ? 'bg-brand-purple hover:bg-brand-purple/80 text-white neon-glow' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
                    >
                      {purchasing === avatar.id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : canAfford ? (
                        <><Zap size={18} /> {avatar.cost} XP</>
                      ) : (
                        <><Lock size={18} /> {avatar.cost} XP</>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
