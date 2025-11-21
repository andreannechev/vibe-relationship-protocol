
import React, { useState, useEffect } from 'react';
import { User, UserStatus, InteractionMode, CommPolicyLevel, Relationship } from '../types';
import { DEFAULT_DIRECTIVES, DEFAULT_CALENDAR_CONFIG, DEFAULT_NEURAL_CONFIG } from '../constants';
import { ArrowLeft, Ghost, Phone, Coffee, Zap, Save, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShadowNodeFormProps {
  onAddShadowNode?: (user: User, driftDays: number, mode: InteractionMode, route: string, rhythms: string[]) => void;
  onUpdateShadowNode?: (userId: string, name: string, driftDays: number, mode: InteractionMode, route: string, rhythms: string[]) => void;
  initialData?: { user: User; relationship: Relationship };
  onBack: () => void;
}

const RHYTHMS = [
  { id: 'weekdays_pm', label: '🌙 After Work', days: 'Mon-Fri' },
  { id: 'weekdays_lunch', label: '🍱 Lunch', days: 'Mon-Fri' },
  { id: 'weekend_am', label: '☀️ Sat Morn', days: 'Sat' },
  { id: 'weekend_pm', label: '🍷 Sat Night', days: 'Sat' },
  { id: 'sunday_brunch', label: '🥞 Sun Brunch', days: 'Sun' },
  { id: 'sunday_eve', label: '🧘 Sun Eve', days: 'Sun' },
  { id: 'spontaneous', label: '⚡ Random', days: 'Any' },
];

// Mapping InteractionMode to UI Options
// We map "ANY" to "Voice / Call" for semantic clarity in Shadow Node context,
// assuming Voice implies higher sync than Text but lower than IRL.
const COSTS = [
  { id: InteractionMode.DIGITAL_OK, label: 'Text Only', icon: MessageSquare, desc: 'Low Energy' },
  { id: InteractionMode.ANY, label: 'Voice / Call', icon: Phone, desc: 'Med Energy' },
  { id: InteractionMode.IRL_ONLY, label: 'In Person', icon: Coffee, desc: 'High Energy' },
];

export const ShadowNodeForm: React.FC<ShadowNodeFormProps> = ({ onAddShadowNode, onUpdateShadowNode, initialData, onBack }) => {
  // Form State
  const [name, setName] = useState('');
  const [route, setRoute] = useState('WhatsApp');
  const [selectedRhythms, setSelectedRhythms] = useState<string[]>([]);
  const [protocolMode, setProtocolMode] = useState<InteractionMode>(InteractionMode.DIGITAL_OK);
  const [driftValue, setDriftValue] = useState(33); // 0-100
  const [loading, setLoading] = useState(false);

  const isEditing = !!initialData;

  // Initialize State if Editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.user.name);
      if (initialData.relationship.preferred_route) setRoute(initialData.relationship.preferred_route);
      if (initialData.relationship.active_rhythms) setSelectedRhythms(initialData.relationship.active_rhythms);
      
      setProtocolMode(initialData.relationship.interaction_mode);

      // Map Days back to Slider Value (Approximation)
      const days = initialData.relationship.drift_threshold_days;
      if (days <= 7) setDriftValue(12);
      else if (days <= 30) setDriftValue(37);
      else if (days <= 90) setDriftValue(62);
      else setDriftValue(87);
    }
  }, [initialData]);

  // Derived State for Preview
  const getDriftLabel = (val: number) => {
    if (val < 25) return { label: "High Maintenance", days: 7 };
    if (val < 50) return { label: "Standard Orbit", days: 30 };
    if (val < 75) return { label: "Low Orbit", days: 90 };
    return { label: "Comet", days: 365 };
  };

  const driftSettings = getDriftLabel(driftValue);

  const toggleRhythm = (id: string) => {
    if (selectedRhythms.includes(id)) {
      setSelectedRhythms(selectedRhythms.filter(r => r !== id));
    } else {
      setSelectedRhythms([...selectedRhythms, id]);
    }
  };

  const handleSubmit = () => {
    if (!name) return;
    setLoading(true);

    setTimeout(() => {
      if (isEditing && onUpdateShadowNode && initialData) {
         onUpdateShadowNode(initialData.user.id, name, driftSettings.days, protocolMode, route, selectedRhythms);
      } else if (onAddShadowNode) {
        // Construct the User for creation
        const shadowUser: User = {
          id: `shadow_${Date.now()}`,
          name: name,
          current_status: UserStatus.OPEN,
          is_shadow: true,
          avatar_url: undefined,
          bio_rhythm: { morning_person: true, weekend_availability: 'HIGH' },
          communication_policy: {
            voice_notes: CommPolicyLevel.TOLERATE,
            unannounced_calls: CommPolicyLevel.TOLERATE,
            text_response_time: "24H"
          },
          directives: DEFAULT_DIRECTIVES,
          calendar_config: DEFAULT_CALENDAR_CONFIG,
          neural_config: DEFAULT_NEURAL_CONFIG
        };
        onAddShadowNode(shadowUser, driftSettings.days, protocolMode, route, selectedRhythms);
      }
    }, 800);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-300 font-sans">
      {/* Header */}
      <div className="p-6 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 flex items-center sticky top-0 z-20">
        <button onClick={onBack} className="text-zinc-500 hover:text-white mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
             <Ghost size={18} className="mr-2 text-emerald-500" />
             {isEditing ? 'Reconfigure Shadow Node' : 'Construct Shadow Node'}
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            {isEditing ? 'Updating parameters...' : 'Programming Virtual Agent...'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 pb-32">
        
        {/* 1. Identity */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-baseline justify-between">
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Identity & Route</label>
             <span className="text-[9px] text-zinc-600 font-mono">Required</span>
           </div>
           
           <div className="flex gap-3">
              <div className="flex-1">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name (e.g. Grandma)"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-900 outline-none placeholder-zinc-600 transition-all"
                />
              </div>
              <div className="w-1/3">
                <select 
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="w-full h-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 text-xs text-zinc-400 focus:border-zinc-700 outline-none appearance-none"
                >
                  <option>WhatsApp</option>
                  <option>iMessage</option>
                  <option>Telegram</option>
                  <option>Phone</option>
                </select>
              </div>
           </div>
        </section>

        {/* 2. Rhythm Heatmap */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
           <div className="flex items-baseline justify-between">
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Availability Rhythm</label>
             <span className="text-[9px] text-zinc-600 font-mono">Select likely times</span>
           </div>

           <div className="flex flex-wrap gap-2">
              {RHYTHMS.map((r) => {
                const isActive = selectedRhythms.includes(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleRhythm(r.id)}
                    className={`
                      px-3 py-2 rounded-md text-xs font-medium border transition-all duration-200 flex items-center
                      ${isActive 
                        ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'}
                    `}
                  >
                    {r.label}
                  </button>
                );
              })}
           </div>
        </section>

        {/* 3. Protocol Cost */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-500">
           <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Interaction Cost</label>
           
           <div className="grid grid-cols-3 gap-2">
              {COSTS.map((c) => {
                const isActive = protocolMode === c.id;
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => setProtocolMode(c.id)}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200
                      ${isActive 
                        ? 'bg-zinc-800 border-zinc-600 text-white shadow-lg' 
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-600 hover:bg-zinc-900'}
                    `}
                  >
                    <Icon size={20} className={`mb-2 ${isActive ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    <span className="text-[10px] font-bold uppercase">{c.label}</span>
                  </button>
                );
              })}
           </div>
        </section>

        {/* 4. Drift Slider */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-16 duration-700">
           <div className="flex items-baseline justify-between">
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Drift Tolerance</label>
             <span className="text-[10px] font-bold text-emerald-500">{driftSettings.label}</span>
           </div>
           
           <div className="relative h-12 flex items-center">
              <div className="absolute w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                 <div className="h-full bg-zinc-600 transition-all" style={{ width: `${driftValue}%` }} />
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={driftValue}
                onChange={(e) => setDriftValue(Number(e.target.value))}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
              />
              {/* Thumb visual */}
              <div 
                className="absolute w-6 h-6 bg-zinc-200 border-2 border-black rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] pointer-events-none transition-all"
                style={{ left: `calc(${driftValue}% - 12px)` }} 
              />
              
              {/* Ticks */}
              <div className="absolute top-4 w-full flex justify-between px-1">
                 {[7, 30, 90, 365].map((d, i) => (
                   <div key={i} className="flex flex-col items-center">
                     <div className="w-0.5 h-2 bg-zinc-800 mb-1" />
                     <span className="text-[9px] text-zinc-600 font-mono">{d}d</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>

      </div>

      {/* 5. Simulation Preview & Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-zinc-950 border-t border-zinc-900 z-30">
         <div className="max-w-md mx-auto space-y-4">
            
            {/* Dynamic Preview Text */}
            <AnimatePresence mode="wait">
               <motion.div 
                 key={name + selectedRhythms.length + driftValue + protocolMode}
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 relative"
               >
                  <div className="absolute -top-2 left-4 bg-zinc-800 text-[9px] text-zinc-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                     Agent Simulation
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    "I will {isEditing ? 'update' : 'create'} a virtual block for <strong className="text-white">{name || 'User'}</strong> on <strong className="text-white">{selectedRhythms.length > 0 ? selectedRhythms.length + ' time slots' : 'unspecified times'}</strong>. 
                    If you haven't spoken in <strong className="text-white">{driftSettings.days} days</strong>, I will nudge you to <strong>{protocolMode === InteractionMode.ANY ? 'Call' : protocolMode === InteractionMode.IRL_ONLY ? 'Meet Up' : 'Text'}</strong> via {route}."
                  </p>
               </motion.div>
            </AnimatePresence>

            <button
              onClick={handleSubmit}
              disabled={!name || loading}
              className={`
                w-full py-4 rounded-lg font-bold text-sm tracking-widest uppercase flex items-center justify-center transition-all shadow-xl
                ${!name 
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-[1.01]'}
              `}
            >
              {loading ? (
                <><Save className="mr-2 animate-spin" size={16} /> {isEditing ? 'Updating...' : 'Initializing...'}</>
              ) : (
                <><Zap className="mr-2 fill-current" size={16} /> {isEditing ? 'Update Shadow Node' : 'Initiate Shadow Node'}</>
              )}
            </button>
         </div>
      </div>

    </div>
  );
};
