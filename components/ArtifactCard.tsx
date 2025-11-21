
import React from 'react';
import { ArtifactSuggestion } from '../types';
import { motion } from 'framer-motion';
import { Search, Gift, X, ExternalLink, Tag } from 'lucide-react';

interface ArtifactCardProps {
  suggestion: ArtifactSuggestion;
  onClose: () => void;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({ suggestion, onClose }) => {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(suggestion.searchQuery + " buy")}`;

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="absolute bottom-24 left-4 right-4 z-50 bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden font-sans"
    >
      {/* Header / Gradient */}
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <div className="p-5 relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center mb-3 text-indigo-600">
           <Gift size={16} className="mr-2" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Artifact Scout Found</span>
        </div>

        <h3 className="text-xl font-bold text-zinc-900 leading-tight mb-1">
          {suggestion.itemName}
        </h3>
        
        <div className="flex items-center mt-2 mb-4">
           <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-xs font-mono font-bold border border-zinc-200">
              {suggestion.currency}{suggestion.estimatedPrice}
           </span>
           <span className="mx-2 text-zinc-300">|</span>
           <span className="text-xs text-zinc-500 flex items-center">
              <Tag size={10} className="mr-1" /> Low Pressure
           </span>
        </div>

        <p className="text-sm text-zinc-600 italic border-l-2 border-indigo-200 pl-3 py-1 mb-5 leading-relaxed">
          "{suggestion.reasoning}"
        </p>

        <a 
          href={searchUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center transition-colors"
        >
           <Search size={14} className="mr-2" />
           Find Item
        </a>
      </div>
    </motion.div>
  );
};
