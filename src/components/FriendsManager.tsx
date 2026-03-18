import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck, Users, Loader2, X } from 'lucide-react';
import { useFriends } from '../hooks/useFriends';
import { useAuth } from '../lib/useAuth';

export const FriendsManager: React.FC = () => {
  const { user } = useAuth();
  const { friends, loading, addFriend, acceptFriend, removeFriend } = useFriends();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <div className="glass p-8 rounded-3xl flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="glass p-8 rounded-3xl space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Users className="text-brand-blue" /> Friends
      </h2>
      <div className="flex gap-2">
        <input 
          type="text"
          placeholder="Search friends by UID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none"
        />
        <button 
          onClick={() => addFriend(searchTerm)}
          className="p-2 bg-brand-blue rounded-xl hover:bg-brand-blue/80 transition-all"
        >
          <UserPlus size={20} />
        </button>
      </div>
      <div className="space-y-2">
        {friends.map(f => (
          <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="font-bold text-sm">
              {f.userId1 === user?.uid ? f.userId2 : f.userId1}
            </span>
            <div className="flex items-center gap-2">
              {f.status === 'accepted' ? (
                <UserCheck className="text-emerald-500" size={18} />
              ) : f.userId2 === user?.uid ? (
                <button onClick={() => acceptFriend(f.id)} className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-lg">Accept</button>
              ) : (
                <span className="text-xs text-slate-500">Pending</span>
              )}
              <button onClick={() => removeFriend(f.id)} className="text-slate-500 hover:text-rose-500">
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
