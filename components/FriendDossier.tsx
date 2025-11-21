
import React, { useState, useEffect } from 'react';
import { User, Relationship, RelationshipAnnotations, UserStatus, EnergyRequirement, ArtifactSuggestion } from '../types';
import { generateArtifactSuggestion } from '../services/geminiService';
import { ArtifactCard } from './ArtifactCard';
import { X, Save, Tag, Battery, MessageSquare, Radar, Power, Zap, Activity, Settings, ArrowRight, Leaf, Eye, EyeOff, Trash2, MoreVertical, Gift, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FriendDossierProps {
  user: User;
  relationship: Relationship;
  onUpdateAnnotations: (annotations: RelationshipAnnotations) => void;
  onScout: () => void;
  onSoftTouch: () => void;
  onToggleHide: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export const FriendDossier: React.FC<FriendDossierProps> = ({ 
  user, 
  relationship, 
  onUpdateAnnotations, 
  onScout, 
  onSoftTouch, 
  onToggleHide,
  onRemove,
  onClose 
}) => {
  
  // Local State for Annotations (Auto-save on blur/close logic handled by parent or explicit save)
  const [annotations, setAnnotations] = useState<RelationshipAnnotations>(relationship.annotations || {
    tags: [],
    energy_requirement: 'MEDIUM',
    notes: '',
    manual_override: { active: false, forced_status: UserStatus.OPEN }
  });

  const [newTag, setNewTag] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  // Artifact Scout State
  const [isScoutingArtifact, setIsScoutingArtifact] = useState(false);
  const [artifact, setArtifact] = useState<ArtifactSuggestion | null>(null);

  // Check if dirty for auto-save or UI feedback
  const isDirty = JSON.stringify(annotations) !== JSON.stringify(relationship.annotations);

  // Telemetry Calculations
  const daysSinceLast = Math.floor((Date.now() - relationship.last_interaction) / (1000 * 60 * 60 * 24));
  
  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.OPEN: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case UserStatus.FLOW_STATE: return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case UserStatus.RECHARGE: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      setAnnotations({ ...annotations, tags: [...annotations.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setAnnotations({ ...annotations, tags: annotations.tags.filter(t => t !== tag) });
  };

  const handleArtifactScout = async () => {
     if (artifact) {
       setArtifact(null); // Toggle off if already showing
       return;
     }
     setIsScoutingArtifact(true);
     const suggestion = await generateArtifactSuggestion(
       user.name,
       [...(relationship.shared_interests || []), ...(annotations.tags || [])],
       annotations.notes
     );
     setArtifact(suggestion);
     setIsScoutingArtifact(false);
  };

  // Autosave effect
  useEffect(() => {
    const timer = setTimeout(() => {
       if (isDirty) onUpdateAnnotations(annotations);
    }, 500);
    return () => clearTimeout(timer);
  }, [annotations]);

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-200 font-sans border-l border-zinc-800 shadow-2xl relative">
      
      {/* ZONE A: LIVE HEADER */}
      <div className="p-6 pb-8 bg-zinc-900 border-b border-zinc-800 relative overflow-hidden">
        {/* Background Gradient based on Status */}
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${user.current_status === UserStatus.OPEN ? 'from-emerald-500/10' : 'from-rose-500/10'} to-transparent blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none`} />

        <div className="flex justify-between items-start relative z-10">
           <button onClick={onClose} className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors">
             <X size={20} />
           </button>
           <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border flex items-center ${getStatusColor(user.current_status)}`}>
             <Activity size={10} className="mr-1 animate-pulse" />
             {user.current_status.replace('_', ' ')}
           </div>
        </div>

        <div className="mt-6 flex items-center space-x-5 relative z-10">
           <div className="relative">
             <div className="w-20 h-20 rounded-full bg-zinc-800 border-4 border-zinc-950 shadow-xl overflow-hidden">
                {user.avatar_url && <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />}
             </div>
             <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-zinc-950 ${user.current_status === UserStatus.OPEN ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
           </div>
           <div>
             <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
               {user.name}
               {relationship.is_hidden && <EyeOff size={16} className="ml-2 text-zinc-600" />}
             </h1>
             <p className="text-xs text-zinc-500 font-mono mt-1 flex items-center">
                Last Contact: <span className="text-zinc-300 ml-1">{daysSinceLast}d ago</span>
             </p>
           </div>
        </div>
      </div>

      {/* ZONE B: THE MANUAL (Annotation Layer) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8" onClick={() => setShowSettings(false)}>
        
        {/* 1. Context Tags */}
        <section className="space-y-3">
           <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center">
             <Tag size={12} className="mr-2" /> Context Tags
           </label>
           <div className="flex flex-wrap gap-2">
              {annotations.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-xs text-zinc-300 flex items-center group">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-2 text-zinc-600 hover:text-rose-500">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input 
                type="text" 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="+ Add tag..."
                className="px-3 py-1 bg-transparent border border-dashed border-zinc-700 rounded-full text-xs text-zinc-500 focus:text-white focus:border-zinc-500 outline-none w-24 focus:w-32 transition-all"
              />
           </div>
        </section>

        {/* 2. Vibe / Energy Slider */}
        <section className="space-y-4">
           <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center">
                <Battery size={12} className="mr-2" /> Energy Requirement
              </label>
              <span className={`text-xs font-bold px-2 py-1 rounded bg-zinc-900 border border-zinc-800 ${
                annotations.energy_requirement === 'LOW' ? 'text-emerald-400' : 
                annotations.energy_requirement === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {annotations.energy_requirement}
              </span>
           </div>
           <div className="relative h-2 bg-zinc-800 rounded-full">
              <div className="absolute top-0 left-0 h-full rounded-full bg-zinc-600" style={{
                 width: annotations.energy_requirement === 'LOW' ? '33%' : annotations.energy_requirement === 'MEDIUM' ? '66%' : '100%'
              }} />
              <input 
                type="range" 
                min="1" max="3" step="1"
                value={annotations.energy_requirement === 'LOW' ? 1 : annotations.energy_requirement === 'MEDIUM' ? 2 : 3}
                onChange={(e) => {
                   const val = Number(e.target.value);
                   const req = val === 1 ? 'LOW' : val === 2 ? 'MEDIUM' : 'HIGH';
                   setAnnotations({ ...annotations, energy_requirement: req });
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex justify-between text-[8px] uppercase text-zinc-600 mt-3 font-bold tracking-wider">
                 <span>Low (Text)</span>
                 <span>Med (Coffee)</span>
                 <span>High (Trip)</span>
              </div>
           </div>
        </section>

        {/* 3. Memory Bank */}
        <section className="space-y-3">
           <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center">
             <MessageSquare size={12} className="mr-2" /> Memory Bank
           </label>
           <textarea 
             value={annotations.notes}
             onChange={(e) => setAnnotations({ ...annotations, notes: e.target.value })}
             placeholder="What binds you together? (e.g., Shared love for 90s hip hop. Hates spicy food.)"
             className="w-full h-24 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 outline-none resize-none leading-relaxed"
           />
           <p className="text-[10px] text-zinc-600 italic">
             * The Agent reads this to generate personalized signals.
           </p>
        </section>

        {/* 4. Manual Override */}
        <section className="border-t border-zinc-800 pt-6">
           <div className="flex items-center justify-between">
              <div>
                 <div className="text-sm font-bold text-zinc-300">Manual Status Override</div>
                 <div className="text-xs text-zinc-500">Force Agent to see this node as...</div>
              </div>
              <button 
                onClick={() => setAnnotations({ 
                   ...annotations, 
                   manual_override: { 
                      active: !annotations.manual_override?.active, 
                      forced_status: annotations.manual_override?.forced_status || UserStatus.OPEN 
                   } 
                })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${annotations.manual_override?.active ? 'bg-indigo-600' : 'bg-zinc-800'}`}
              >
                 <div className={`w-4 h-4 bg-white rounded-full transition-transform ${annotations.manual_override?.active ? 'translate-x-6' : ''}`} />
              </button>
           </div>
           
           {annotations.manual_override?.active && (
              <div className="mt-4 flex gap-2">
                 {[UserStatus.OPEN, UserStatus.RECHARGE].map(status => (
                    <button 
                      key={status}
                      onClick={() => setAnnotations({ 
                         ...annotations, 
                         manual_override: { active: true, forced_status: status } 
                      })}
                      className={`flex-1 py-2 text-xs font-bold uppercase rounded border ${
                         annotations.manual_override?.forced_status === status 
                         ? 'bg-zinc-800 border-zinc-600 text-white' 
                         : 'bg-transparent border-zinc-800 text-zinc-600'
                      }`}
                    >
                       {status}
                    </button>
                 ))}
              </div>
           )}
        </section>
        
        {/* Spacer for Footer */}
        <div className="h-20" />
      </div>

      {/* ZONE C: ACTION DECK (Footer) */}
      <div className="p-6 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800">
         <div className="grid grid-cols-6 gap-3 relative">
            
            {/* Primary: SCOUT */}
            <button 
              onClick={onScout}
              className="col-span-2 py-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg font-bold text-sm uppercase tracking-wide flex flex-col items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all active:scale-95"
            >
               <div className="flex items-center mb-1">
                  <Radar size={16} className="mr-2" />
                  Scout
               </div>
               <span className="text-[8px] opacity-60 font-normal normal-case">Check Protocol</span>
            </button>

            {/* Secondary: SOFT TOUCH */}
            <button 
              onClick={onSoftTouch}
              className="col-span-2 py-4 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-lg font-bold text-sm uppercase tracking-wide flex flex-col items-center justify-center border border-zinc-700 transition-all active:scale-95"
            >
               <div className="flex items-center mb-1">
                  <Leaf size={16} className="mr-2" />
                  Soft Touch
               </div>
               <span className="text-[8px] text-zinc-500 font-normal normal-case">Low-Effort Signal</span>
            </button>

            {/* Tertiary: ARTIFACT SCOUT */}
            <button 
               onClick={handleArtifactScout}
               className={`col-span-1 py-4 rounded-lg font-bold flex items-center justify-center transition-all active:scale-95 border ${isScoutingArtifact ? 'bg-zinc-900 border-zinc-600 text-white' : 'bg-zinc-900 border-zinc-800 text-purple-400 hover:border-purple-500/30'}`}
            >
               {isScoutingArtifact ? <Loader2 size={18} className="animate-spin" /> : <Gift size={18} />}
            </button>

            {/* Settings (Gear Icon) */}
            <div className="col-span-1 relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`w-full h-full bg-zinc-900 border rounded-lg flex items-center justify-center transition-colors ${showSettings ? 'border-zinc-500 text-white' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
              >
                <Settings size={18} />
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50"
                  >
                     <button 
                       onClick={() => { onToggleHide(); setShowSettings(false); }}
                       className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 flex items-center"
                     >
                        {relationship.is_hidden ? <Eye size={14} className="mr-2" /> : <EyeOff size={14} className="mr-2" />}
                        {relationship.is_hidden ? 'Unhide Node' : 'Hide Node'}
                     </button>
                     
                     {!confirmRemove ? (
                       <button 
                         onClick={() => setConfirmRemove(true)}
                         className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-rose-900 hover:bg-rose-950 hover:text-rose-500 flex items-center border-t border-zinc-800"
                       >
                          <Trash2 size={14} className="mr-2" />
                          Disconnect
                       </button>
                     ) : (
                       <button 
                         onClick={() => { onRemove(); setConfirmRemove(false); }}
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

      {/* Artifact Scout Overlay */}
      <AnimatePresence>
        {artifact && (
           <ArtifactCard suggestion={artifact} onClose={() => setArtifact(null)} />
        )}
      </AnimatePresence>

    </div>
  );
};
