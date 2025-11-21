
import React, { useState } from 'react';
import { User, Relationship, InteractionMode } from '../types';
import { ArrowLeft, Ghost, MessageSquare, Clock, MoreVertical, Edit3, Trash2, RotateCcw, Sparkles, Eye, EyeOff, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShadowNodeDetailProps {
  user: User;
  relationship: Relationship;
  onEdit: () => void;
  onBack: () => void;
  onLogInteraction: () => void;
  onOpenSignalDeck: () => void;
  onRemove: () => void;
  onToggleHide: () => void;
}

export const ShadowNodeDetail: React.FC<ShadowNodeDetailProps> = ({ 
  user, 
  relationship, 
  onEdit, 
  onBack, 
  onLogInteraction, 
  onOpenSignalDeck,
  onRemove,
  onToggleHide
}) => {
  
  const [showMenu, setShowMenu] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const daysSinceLast = Math.floor((Date.now() - relationship.last_interaction) / (1000 * 60 * 60 * 24));
  const driftThreshold = relationship.drift_threshold_days;
  const driftPercent = Math.min(100, (daysSinceLast / driftThreshold) * 100);
  const isDrifted = daysSinceLast > driftThreshold;

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-300 font-sans" onClick={() => setShowMenu(false)}>
      {/* Header */}
      <div className="p-6 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center">
           <button onClick={onBack} className="text-zinc-500 hover:text-white mr-4 transition-colors">
             <ArrowLeft size={24} />
           </button>
           <div>
             <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
                <Ghost size={18} className="mr-2 text-indigo-500" />
                {user.name}
                {relationship.is_hidden && <EyeOff size={16} className="ml-2 text-zinc-600" />}
             </h1>
             <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Shadow Node</p>
           </div>
        </div>
        
        <div className="flex items-center space-x-2">
            <button 
               onClick={onEdit}
               className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
               title="Edit Configuration"
            >
               <Edit3 size={16} />
            </button>
            
            <div className="relative">
                <button 
                   onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                   className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                   <MoreVertical size={16} />
                </button>

                <AnimatePresence>
                    {showMenu && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-10 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50"
                        >
                            <button 
                                onClick={() => { onToggleHide(); setShowMenu(false); }}
                                className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 flex items-center"
                            >
                                {relationship.is_hidden ? <Eye size={14} className="mr-2" /> : <EyeOff size={14} className="mr-2" />}
                                {relationship.is_hidden ? 'Unhide Node' : 'Hide Node'}
                            </button>
                            
                            {!confirmRemove ? (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setConfirmRemove(true); }}
                                    className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-rose-900 hover:bg-rose-950 hover:text-rose-500 flex items-center border-t border-zinc-800"
                                >
                                    <Trash2 size={14} className="mr-2" />
                                    Delete Node
                                </button>
                            ) : (
                                <button 
                                    onClick={onRemove}
                                    className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-white bg-rose-600 hover:bg-rose-500 flex items-center"
                                >
                                    <Trash2 size={14} className="mr-2 fill-white" />
                                    Confirm?
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Status Card */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
           <div className={`absolute top-0 left-0 w-1 h-full ${isDrifted ? 'bg-amber-500' : 'bg-indigo-500'}`} />
           <div className="flex items-start justify-between mb-6">
              <div>
                 <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Connection Status</h3>
                 <div className={`text-2xl font-bold ${isDrifted ? 'text-amber-500' : 'text-emerald-400'}`}>
                    {isDrifted ? 'Drifted' : 'In Orbit'}
                 </div>
              </div>
              <div className="text-right">
                 <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Last Contact</h3>
                 <div className="text-xl font-mono text-zinc-200">
                    {daysSinceLast}d <span className="text-zinc-600 text-sm">ago</span>
                 </div>
              </div>
           </div>

           {/* Drift Bar */}
           <div className="mb-6">
              <div className="flex justify-between text-[10px] text-zinc-500 uppercase mb-2">
                 <span>Drift Accumulation</span>
                 <span>Limit: {driftThreshold}d</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden relative">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${driftPercent}%` }}
                    className={`h-full ${isDrifted ? 'bg-amber-500' : 'bg-indigo-500'}`}
                 />
              </div>
           </div>

           {/* Manual Logging Action */}
           <button 
             onClick={onLogInteraction}
             className="w-full py-3 border border-zinc-700 hover:bg-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center transition-all text-zinc-300 hover:text-white"
           >
              <RotateCcw size={14} className="mr-2" />
              Log Manual Interaction
           </button>
        </section>

        {/* Configuration Detail */}
        <section className="space-y-4">
           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Node Configuration</h3>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                 <div className="flex items-center text-zinc-500 mb-2">
                    <MessageSquare size={14} className="mr-2" />
                    <span className="text-[10px] uppercase">Preferred Route</span>
                 </div>
                 <div className="text-sm font-bold text-white">
                    {relationship.preferred_route || 'WhatsApp'}
                 </div>
              </div>

              <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                 <div className="flex items-center text-zinc-500 mb-2">
                    <Activity size={14} className="mr-2" />
                    <span className="text-[10px] uppercase">Mode</span>
                 </div>
                 <div className="text-sm font-bold text-white">
                    {relationship.interaction_mode === InteractionMode.IRL_ONLY ? 'In Person' : 
                     relationship.interaction_mode === InteractionMode.DIGITAL_OK ? 'Digital' : 'Any'}
                 </div>
              </div>
           </div>

           <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <div className="flex items-center text-zinc-500 mb-3">
                 <Clock size={14} className="mr-2" />
                 <span className="text-[10px] uppercase">Active Rhythms</span>
              </div>
              <div className="flex flex-wrap gap-2">
                 {relationship.active_rhythms && relationship.active_rhythms.length > 0 ? (
                    relationship.active_rhythms.map((r, i) => (
                       <span key={i} className="px-2 py-1 bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-[10px] rounded font-medium uppercase">
                          {r.replace('_', ' ')}
                       </span>
                    ))
                 ) : (
                    <span className="text-zinc-600 text-xs italic">No specific rhythms set.</span>
                 )}
              </div>
           </div>
        </section>

      </div>

      {/* Footer Action: Signal Deck */}
      <div className="p-6 bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 sticky bottom-0 z-20">
         <button 
           onClick={onOpenSignalDeck}
           className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center shadow-lg shadow-indigo-900/20 transition-all"
         >
            <Sparkles size={16} className="mr-2 fill-current" />
            Open Signal Deck
         </button>
      </div>

    </div>
  );
};
