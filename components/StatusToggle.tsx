import React from 'react';
import { UserStatus } from '../types';
import { APP_COLORS } from '../constants';
import { motion } from 'framer-motion';

interface StatusToggleProps {
  currentStatus: UserStatus;
  onStatusChange: (status: UserStatus) => void;
}

export const StatusToggle: React.FC<StatusToggleProps> = ({ currentStatus, onStatusChange }) => {
  const statuses = [
    { id: UserStatus.OPEN, label: 'OPEN', color: APP_COLORS.status.green, desc: 'Social' },
    { id: UserStatus.TRAVEL, label: 'TRAVEL', color: APP_COLORS.status.yellow, desc: 'Transit' },
    { id: UserStatus.RECHARGE, label: 'RECHARGE', color: APP_COLORS.status.red, desc: 'Offline' },
    { id: UserStatus.FLOW_STATE, label: 'FLOW', color: APP_COLORS.status.red, desc: 'Focus' },
  ];

  return (
    <div className="w-full grid grid-cols-2 gap-3">
      {statuses.map((s) => {
        const isActive = currentStatus === s.id;
        return (
          <motion.button
            key={s.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStatusChange(s.id)}
            className={`
              relative flex flex-col items-start p-4 rounded-none border
              transition-all duration-200
              ${isActive 
                ? 'bg-zinc-900 border-zinc-900 text-white' 
                : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300'}
            `}
          >
            <div className="flex items-center w-full justify-between mb-2">
              <span className={`text-xs font-bold tracking-wider ${isActive ? 'text-zinc-300' : 'text-zinc-400'}`}>
                {s.label}
              </span>
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
            </div>
            <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-zinc-600'}`}>
              {s.desc}
            </span>
            
            {isActive && (
              <motion.div 
                layoutId="active-ring"
                className="absolute inset-0 border-2 border-zinc-900 pointer-events-none"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};