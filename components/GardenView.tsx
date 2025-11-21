
import React from 'react';
import { User, Relationship, UserStatus } from '../types';
import { motion } from 'framer-motion';
import { Flower2, Trees, Sprout, Cloud, Leaf, Droplets } from 'lucide-react';

interface GardenViewProps {
  friends: User[];
  relationships: Relationship[];
  onSelectFriend: (friendId: string) => void;
}

export const GardenView: React.FC<GardenViewProps> = ({ friends, relationships, onSelectFriend }) => {

  const getPlantIcon = (status: UserStatus) => {
    switch (status) {
      case UserStatus.OPEN: return { icon: Flower2, color: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.4)]', type: 'Blooming' };
      case UserStatus.FLOW_STATE: return { icon: Trees, color: 'text-rose-400', glow: '', type: 'Rooted' };
      case UserStatus.RECHARGE: return { icon: Leaf, color: 'text-amber-600', glow: '', type: 'Dormant' };
      case UserStatus.TRAVEL: return { icon: Cloud, color: 'text-sky-400', glow: '', type: 'Drifting' };
      default: return { icon: Sprout, color: 'text-zinc-500', glow: '', type: 'Seed' };
    }
  };

  return (
    <div className="absolute inset-0 bg-zinc-950 flex flex-col overflow-hidden">
      {/* Garden Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black opacity-80" />
      
      {/* Header info */}
      <div className="absolute top-24 left-0 right-0 text-center z-10 pointer-events-none">
         <h2 className="text-[10px] font-bold text-emerald-800 uppercase tracking-[0.5em]">Digital Zen Garden</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pt-32 pb-32 grid grid-cols-2 sm:grid-cols-3 gap-6 relative z-0">
        {friends.map((friend, idx) => {
          const rel = relationships.find(r => r.user_b === friend.id);
          if (!rel) return null;
          
          const Plant = getPlantIcon(friend.current_status);
          const Icon = Plant.icon;
          const isDrifted = (Date.now() - rel.last_interaction) > (rel.drift_threshold_days * 24 * 60 * 60 * 1000);

          return (
            <motion.button
              key={friend.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1, type: 'spring' }}
              onClick={() => onSelectFriend(friend.id)}
              className="flex flex-col items-center justify-end aspect-square rounded-2xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900 hover:border-emerald-900/50 transition-all group relative overflow-visible"
            >
              {/* Soil / Base */}
              <div className="absolute bottom-3 w-12 h-1 bg-black/50 blur-sm rounded-full" />
              
              {/* The Plant */}
              <div className={`mb-6 transition-transform duration-500 group-hover:-translate-y-2 ${Plant.color} ${isDrifted ? 'grayscale opacity-50' : ''}`}>
                 <Icon 
                   size={48} 
                   strokeWidth={1.5}
                   className={`drop-shadow-2xl ${friend.current_status === UserStatus.OPEN ? 'animate-pulse-slow' : ''}`}
                 />
                 
                 {/* Special Effects */}
                 {friend.current_status === UserStatus.OPEN && (
                   <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                 )}
                 {friend.current_status === UserStatus.TRAVEL && (
                   <div className="absolute -top-4 -right-4 opacity-50 animate-bounce"><Cloud size={16} /></div>
                 )}
              </div>

              {/* Water Needed Indicator */}
              {isDrifted && (
                <div className="absolute top-3 right-3 text-amber-700/50 animate-pulse">
                  <Droplets size={14} />
                </div>
              )}

              {/* Label */}
              <div className="mb-4 text-center">
                <div className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors font-mono">
                  {friend.name}
                </div>
                <div className="text-[9px] text-zinc-600 uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isDrifted ? 'Needs Water' : Plant.type}
                </div>
              </div>

            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
