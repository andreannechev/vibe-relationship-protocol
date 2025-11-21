
import React from 'react';
import { User, Relationship, UserStatus } from '../types';
import { APP_COLORS } from '../constants';
import { motion } from 'framer-motion';
import { User as UserIcon, Battery, Zap, MessageSquare, Hash, EyeOff } from 'lucide-react';

interface FriendListProps {
  friends: User[];
  relationships: Relationship[];
  onSelectFriend: (friendId: string) => void;
}

export const FriendList: React.FC<FriendListProps> = ({ friends, relationships, onSelectFriend }) => {

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.OPEN: return 'bg-emerald-500 shadow-[0_0_10px_#10b981]';
      case UserStatus.TRAVEL: return 'bg-amber-500';
      case UserStatus.RECHARGE: return 'bg-rose-500';
      case UserStatus.FLOW_STATE: return 'bg-indigo-500';
      default: return 'bg-zinc-500';
    }
  };

  // Partition friends into Active and Hidden
  const activeFriends: User[] = [];
  const hiddenFriends: User[] = [];

  friends.forEach(f => {
    const rel = relationships.find(r => r.user_b === f.id);
    if (rel?.is_hidden) {
      hiddenFriends.push(f);
    } else {
      activeFriends.push(f);
    }
  });

  // Sort Active: Open first, then Travel, then others.
  activeFriends.sort((a, b) => {
    const score = (s: UserStatus) => {
      if (s === UserStatus.OPEN) return 0;
      if (s === UserStatus.TRAVEL) return 1;
      return 2;
    };
    return score(a.current_status) - score(b.current_status);
  });

  const renderRow = (friend: User, rel: Relationship, isHidden: boolean, idx: number) => {
      const isDrifted = (Date.now() - rel.last_interaction) > (rel.drift_threshold_days * 24 * 60 * 60 * 1000);
      return (
        <motion.div
          key={friend.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectFriend(friend.id)}
          className={`group relative flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer overflow-hidden mb-2
            ${isHidden ? 'bg-zinc-950 border-zinc-900 opacity-60 hover:opacity-100' : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'}
          `}
        >
          {/* Hover Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-center relative z-10">
             {/* Avatar / Status */}
             <div className="relative mr-4">
                <div className={`w-10 h-10 rounded bg-zinc-800 flex items-center justify-center overflow-hidden border ${isHidden ? 'border-zinc-800' : 'border-zinc-700'} group-hover:border-zinc-500 transition-colors`}>
                   {friend.avatar_url ? <img src={friend.avatar_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" /> : <UserIcon size={16} className="text-zinc-500" />}
                </div>
                {!isHidden && <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-zinc-900 ${getStatusColor(friend.current_status)}`} />}
                {isHidden && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500"><EyeOff size={10} /></div>}
             </div>

             {/* Text Info */}
             <div className="flex flex-col">
                <div className="flex items-center">
                   <span className={`text-sm font-bold mr-2 ${isHidden ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-zinc-200'}`}>{friend.name}</span>
                   {rel.tier === 'INNER_CIRCLE' && !isHidden && <span className="text-[9px] bg-indigo-900/50 text-indigo-300 px-1.5 rounded border border-indigo-500/20">INNER</span>}
                </div>
                <div className="flex items-center mt-0.5 space-x-2">
                   <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
                     {friend.current_status.replace('_', ' ')}
                   </span>
                   <span className="text-[10px] text-zinc-600">•</span>
                   <span className={`text-[10px] ${isDrifted && !isHidden ? 'text-amber-500' : 'text-zinc-500'}`}>
                     {Math.floor((Date.now() - rel.last_interaction) / (1000 * 60 * 60 * 24))}d ago
                   </span>
                </div>
             </div>
          </div>

          {/* Action Icon */}
          <div className="text-zinc-600 group-hover:text-emerald-400 transition-colors relative z-10">
             <MessageSquare size={18} />
          </div>
        </motion.div>
      );
  };

  return (
    <div className="flex flex-col w-full min-h-full pt-24 px-4 pb-32 overflow-y-auto bg-zinc-950">
      
      {/* Active List */}
      <div className="flex items-center justify-between mb-4 px-2">
         <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Nodes</h2>
         <div className="flex items-center text-[10px] text-zinc-600 font-mono">
            <Hash size={10} className="mr-1" />
            {activeFriends.length}
         </div>
      </div>

      <div className="space-y-1 mb-8">
        {activeFriends.map((friend, idx) => {
          const rel = relationships.find(r => r.user_b === friend.id);
          if (!rel) return null;
          return renderRow(friend, rel, false, idx);
        })}
        {activeFriends.length === 0 && (
            <div className="text-center py-8 text-zinc-600 text-xs italic">No active nodes on radar.</div>
        )}
      </div>

      {/* Hidden List */}
      {hiddenFriends.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-4 px-2 border-t border-zinc-900 pt-6">
                <h2 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Hidden / Archived</h2>
                <div className="flex items-center text-[10px] text-zinc-700 font-mono">
                    {hiddenFriends.length}
                </div>
            </div>
            <div className="space-y-1">
                {hiddenFriends.map((friend, idx) => {
                    const rel = relationships.find(r => r.user_b === friend.id);
                    if (!rel) return null;
                    return renderRow(friend, rel, true, idx);
                })}
            </div>
        </div>
      )}
    </div>
  );
};