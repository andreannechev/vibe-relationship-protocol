
import React from 'react';
import { User, UserStatus, Relationship } from '../types';
import { motion } from 'framer-motion';
import { Radio, ChevronRight, MessageSquare } from 'lucide-react';

interface ControlDeckProps {
  friends: User[];
  relationships: Relationship[];
  onSelectFriend: (friendId: string) => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({ friends, relationships, onSelectFriend }) => {
  
  // Find a "Suggested Maneuver"
  // Priority: Inner Circle + Open > Friend + Open > Drifted
  const suggestedFriend = friends
    .filter(f => f.current_status === UserStatus.OPEN)
    .sort((a, b) => {
      const relA = relationships.find(r => r.user_b === a.id);
      const relB = relationships.find(r => r.user_b === b.id);
      // Sort logic could be deeper, simplified for now
      return (relA?.tier === 'INNER_CIRCLE' ? -1 : 1);
    })[0];

  if (!suggestedFriend) {
    // Fallback state if no one is online
    return (
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between text-zinc-500">
           <span className="text-xs font-mono uppercase tracking-widest flex items-center">
             <Radio size={12} className="mr-2 animate-pulse" /> 
             Scanning Sector...
           </span>
           <span className="text-xs">No active targets.</span>
        </div>
      </div>
    );
  }

  const rel = relationships.find(r => r.user_b === suggestedFriend.id);

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 z-20 pb-8 pt-2"
    >
      <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mt-2 mb-4" />
      
      <div className="max-w-md mx-auto px-6">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
           Suggested Maneuver
        </h3>

        <button 
          onClick={() => onSelectFriend(suggestedFriend.id)}
          className="w-full bg-black/40 border border-zinc-700 hover:border-emerald-500/50 p-4 rounded-lg flex items-center justify-between group transition-all"
        >
           <div className="flex items-center">
              <div className="relative mr-4">
                 <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                    {suggestedFriend.avatar_url && <img src={suggestedFriend.avatar_url} alt="" className="opacity-80" />}
                 </div>
                 <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-900 border border-emerald-500 rounded-full flex items-center justify-center text-[8px] text-emerald-400">
                   <MessageSquare size={8} />
                 </div>
              </div>
              <div className="text-left">
                 <div className="text-sm font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                   Connect with {suggestedFriend.name}
                 </div>
                 <div className="text-xs text-zinc-500 font-mono mt-0.5">
                   {rel?.shared_interests[0]} • {suggestedFriend.current_status.replace('_', ' ')}
                 </div>
              </div>
           </div>
           
           <div className="flex items-center text-xs font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">
              Initiate
              <ChevronRight size={14} className="ml-1" />
           </div>
        </button>
      </div>
    </motion.div>
  );
};
