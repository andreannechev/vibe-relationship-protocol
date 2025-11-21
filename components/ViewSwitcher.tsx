
import React from 'react';
import { DashboardMode } from '../types';
import { Radar, List, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

interface ViewSwitcherProps {
  currentMode: DashboardMode;
  onChange: (mode: DashboardMode) => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentMode, onChange }) => {
  const modes: { id: DashboardMode; icon: any; label: string }[] = [
    { id: 'RADAR', icon: Radar, label: 'Orbit' },
    { id: 'GARDEN', icon: Sprout, label: 'Flora' },
    { id: 'LIST', icon: List, label: 'Log' },
  ];

  return (
    <div className="flex bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-full p-1 gap-1 shadow-xl">
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`
              relative flex items-center justify-center w-10 h-10 rounded-full transition-all
              ${isActive ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'}
            `}
          >
            {isActive && (
              <motion.div 
                layoutId="view-switch-bg"
                className="absolute inset-0 bg-zinc-200 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">
              <Icon size={18} strokeWidth={2.5} />
            </span>
          </button>
        );
      })}
    </div>
  );
};
