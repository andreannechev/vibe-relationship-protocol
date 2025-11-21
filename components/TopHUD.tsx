
import React from 'react';
import { User, UserStatus } from '../types';
import { Activity, BrainCircuit, Calendar, Wifi, WifiOff, Power } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopHUDProps {
  user: User;
  onToggleStatus: () => void;
  onOpenProfile: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({ user, onToggleStatus, onOpenProfile }) => {
  
  const isOnline = user.current_status === UserStatus.OPEN;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 p-4 pointer-events-none">
      <div className="flex items-start justify-between pointer-events-auto">
        
        {/* Left: Self State */}
        <div className="flex flex-col space-y-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleStatus}
            className={`
              flex items-center space-x-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-lg transition-all
              ${isOnline 
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400' 
                : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'}
            `}
          >
            <Power size={18} className={isOnline ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : ''} />
            <div className="flex flex-col items-start">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">My Status</span>
              <span className="text-sm font-bold tracking-wide">{user.current_status.replace('_', ' ')}</span>
            </div>
          </motion.button>
        </div>

        {/* Right: Signal Inputs */}
        <div className="flex space-x-2">
          {/* Calendar Signal */}
          <motion.button 
             onClick={onOpenProfile}
             className="w-10 h-10 rounded-lg bg-zinc-900/80 border border-zinc-700 backdrop-blur-md flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors relative"
          >
            <Calendar size={16} />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </motion.button>

          {/* Neural Signal */}
          <motion.button 
             onClick={onOpenProfile}
             className={`w-10 h-10 rounded-lg border backdrop-blur-md flex items-center justify-center transition-colors relative
               ${user.neural_config.enabled 
                 ? 'bg-indigo-950/50 border-indigo-500/30 text-indigo-400' 
                 : 'bg-zinc-900/80 border-zinc-700 text-zinc-500'}
             `}
          >
            <BrainCircuit size={16} />
            {user.neural_config.enabled && (
               <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-[8px] font-bold px-1 rounded text-white">ON</div>
            )}
          </motion.button>
        </div>

      </div>
      
      {/* Sub-HUD: Battery / Vibe Text */}
      <div className="mt-2 flex items-center space-x-4 text-[10px] text-zinc-500 font-mono uppercase tracking-wider pointer-events-none">
         <span className="flex items-center">
            <Activity size={10} className="mr-1" />
            Battery: 85%
         </span>
         {user.neural_config.current_vibe && (
           <span className="flex items-center text-indigo-400/80">
              <Wifi size={10} className="mr-1" />
              Detecting: {user.neural_config.current_vibe.current_topics[0]}
           </span>
         )}
      </div>
    </div>
  );
};
