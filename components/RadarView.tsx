
import React from 'react';
import { User, UserStatus, Relationship } from '../types';
import { motion } from 'framer-motion';
import { Lock, Zap, Plane, BatteryWarning, User as UserIcon } from 'lucide-react';

interface RadarViewProps {
  friends: User[];
  relationships: Relationship[];
  onSelectFriend: (friendId: string) => void;
}

export const RadarView: React.FC<RadarViewProps> = ({ friends, relationships, onSelectFriend }) => {
  
  // 1. Sort friends into Rings
  const rings = {
    inner: [] as User[],  // Green (Available + Close)
    middle: [] as User[], // Yellow (Travel or Drifted)
    outer: [] as User[],  // Red (Busy)
  };

  friends.forEach(f => {
    const rel = relationships.find(r => r.user_b === f.id);
    if (!rel) return;

    // Logic:
    // If RECHARGE or FLOW -> Outer Ring
    // If TRAVEL -> Middle Ring
    // If OPEN -> Inner Ring
    if (f.current_status === UserStatus.RECHARGE || f.current_status === UserStatus.FLOW_STATE) {
      rings.outer.push(f);
    } else if (f.current_status === UserStatus.TRAVEL) {
      rings.middle.push(f);
    } else {
      rings.inner.push(f);
    }
  });

  // Helper to distribute nodes along a circle
  const renderRingNodes = (ringUsers: User[], radius: number, ringType: 'inner' | 'middle' | 'outer') => {
    const count = ringUsers.length;
    if (count === 0) return null;

    const angleStep = (2 * Math.PI) / count;
    // Offset start angle slightly for aesthetics
    const startAngle = ringType === 'inner' ? 0 : (ringType === 'middle' ? 0.5 : 1); 

    return ringUsers.map((friend, i) => {
      const angle = startAngle + (i * angleStep);
      // Convert polar to cartesian. Center is 50% 50%.
      // We use % for responsiveness.
      // radius is in %.
      const x = 50 + (radius * Math.cos(angle));
      const y = 50 + (radius * Math.sin(angle));

      // Determine Icon based on status
      let StatusIcon = UserIcon;
      if (friend.current_status === UserStatus.FLOW_STATE) StatusIcon = Lock;
      if (friend.current_status === UserStatus.RECHARGE) StatusIcon = BatteryWarning;
      if (friend.current_status === UserStatus.TRAVEL) StatusIcon = Plane;
      if (friend.current_status === UserStatus.OPEN) StatusIcon = Zap;

      return (
        <motion.button
          key={friend.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 + (radius/100) }}
          onClick={() => onSelectFriend(friend.id)}
          className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex flex-col items-center justify-center z-10 group"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          {/* Avatar Circle */}
          <div className={`
            w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-lg relative transition-transform group-hover:scale-110
            ${ringType === 'inner' ? 'bg-emerald-900/80 border-emerald-500 text-emerald-400' : ''}
            ${ringType === 'middle' ? 'bg-amber-900/80 border-amber-500 text-amber-400' : ''}
            ${ringType === 'outer' ? 'bg-rose-900/80 border-rose-900 text-rose-700 opacity-70' : ''}
          `}
          >
             {/* Real Avatar Image or Icon */}
             {friend.avatar_url ? (
               <img src={friend.avatar_url} alt={friend.name} className="w-full h-full rounded-full object-cover opacity-80 hover:opacity-100" />
             ) : (
               <StatusIcon size={16} />
             )}
             
             {/* Status Badge Mini */}
             <div className={`
               absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] bg-zinc-950 border border-zinc-800
               ${ringType === 'inner' ? 'text-emerald-500' : ringType === 'middle' ? 'text-amber-500' : 'text-rose-500'}
             `}>
               <StatusIcon size={8} />
             </div>
          </div>

          {/* Name Label (Hidden by default, visible on hover or if few users) */}
          <span className="mt-1 text-[9px] font-mono uppercase tracking-widest text-zinc-400 bg-zinc-900/80 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {friend.name}
          </span>
        </motion.button>
      );
    });
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-zinc-950">
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Radar Scan Line */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,rgba(16,185,129,0.1)_360deg)] rounded-full opacity-30" />
      </div>

      {/* Container for Rings */}
      <div className="relative w-[80vw] h-[80vw] max-w-[400px] max-h-[400px]">
        
        {/* CENTER: YOU */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-zinc-200 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20" />

        {/* RING 1: INNER (Green) */}
        <div className="absolute inset-[25%] rounded-full border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]" />
        {renderRingNodes(rings.inner, 25, 'inner')}

        {/* RING 2: MIDDLE (Yellow) */}
        <div className="absolute inset-[10%] rounded-full border border-amber-500/10 border-dashed" />
        {renderRingNodes(rings.middle, 40, 'middle')}

        {/* RING 3: OUTER (Red) */}
        <div className="absolute inset-[-5%] rounded-full border border-rose-500/10 opacity-50" />
        {renderRingNodes(rings.outer, 55, 'outer')}

      </div>
      
    </div>
  );
};
