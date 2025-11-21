
import React, { useState } from 'react';
import { User, Directives, AgentAutonomyLevel, LocationPrecision, CalendarGranularity } from '../types';
import { ArrowLeft, Shield, Cpu, Book, ChevronRight, Zap, Lock, MapPin, Calendar, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { TestFlight } from './TestFlight';

interface DirectivesEditorProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
}

export const DirectivesEditor: React.FC<DirectivesEditorProps> = ({ user, onUpdateUser, onBack }) => {
  const [directives, setDirectives] = useState<Directives>(user.directives);
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'AUTONOMY' | 'POLICY'>('SYSTEM');
  const [showTestFlight, setShowTestFlight] = useState(false);

  const updateDirectives = (newDirectives: Directives) => {
    setDirectives(newDirectives);
    onUpdateUser({ ...user, directives: newDirectives });
  };

  const AutonomyCard = ({ level, title, desc, icon: Icon }: any) => {
    const isSelected = directives.agent_autonomy.level === level;
    return (
      <button
        onClick={() => updateDirectives({
          ...directives,
          agent_autonomy: { ...directives.agent_autonomy, level }
        })}
        className={`
          w-full p-4 border text-left rounded-lg transition-all flex items-start space-x-4
          ${isSelected ? 'bg-zinc-900 border-zinc-900' : 'bg-white border-zinc-200 hover:border-zinc-300'}
        `}
      >
        <div className={`p-2 rounded-full ${isSelected ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
          <Icon size={20} />
        </div>
        <div>
          <h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-zinc-900'}`}>{title}</h4>
          <p className={`text-xs mt-1 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>{desc}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col bg-zinc-50">
      {/* Header */}
      <div className="p-6 bg-white border-b border-zinc-200 flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="text-zinc-400 hover:text-zinc-900 mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-light text-zinc-900">Directives</h1>
          <p className="text-xs text-zinc-400 uppercase tracking-widest">Agent Configuration</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 mx-6 mt-6 bg-zinc-200 rounded-lg">
        {[
          { id: 'SYSTEM', label: 'Permissions', icon: Shield },
          { id: 'AUTONOMY', label: 'Autonomy', icon: Cpu },
          { id: 'POLICY', label: 'Rulebook', icon: Book }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 py-2 text-xs font-bold uppercase flex items-center justify-center rounded-md transition-all
              ${activeTab === tab.id ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}
            `}
          >
            <tab.icon size={14} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* LAYER 1: SYSTEM INTEGRITY */}
        {activeTab === 'SYSTEM' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            
            <div className="bg-white p-5 rounded-lg border border-zinc-200">
              <div className="flex items-center mb-4 text-zinc-900">
                <MapPin size={18} className="mr-2" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Location Precision</h3>
              </div>
              <div className="space-y-2">
                {(['CITY', 'NEIGHBORHOOD', 'PRECISE'] as LocationPrecision[]).map((opt) => (
                  <label key={opt} className="flex items-center p-2 hover:bg-zinc-50 rounded cursor-pointer">
                    <input 
                      type="radio" 
                      name="location" 
                      checked={directives.system_permissions.location_precision === opt}
                      onChange={() => updateDirectives({
                        ...directives,
                        system_permissions: { ...directives.system_permissions, location_precision: opt }
                      })}
                      className="text-zinc-900 focus:ring-zinc-500"
                    />
                    <span className="ml-3 text-sm font-medium text-zinc-700 capitalize">{opt.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-zinc-200">
              <div className="flex items-center mb-4 text-zinc-900">
                <Calendar size={18} className="mr-2" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Calendar Access</h3>
              </div>
              <div className="space-y-2">
                <label className="flex items-center p-2 hover:bg-zinc-50 rounded cursor-pointer">
                  <input 
                    type="radio" 
                    name="calendar"
                    checked={directives.system_permissions.calendar_granularity === 'BUSY_FREE'}
                    onChange={() => updateDirectives({
                      ...directives,
                      system_permissions: { ...directives.system_permissions, calendar_granularity: 'BUSY_FREE' }
                    })}
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-zinc-700">Busy / Free</span>
                    <span className="block text-xs text-zinc-400">Agent sees blocks, not details.</span>
                  </div>
                </label>
                <label className="flex items-center p-2 hover:bg-zinc-50 rounded cursor-pointer">
                  <input 
                    type="radio" 
                    name="calendar"
                    checked={directives.system_permissions.calendar_granularity === 'FULL_CONTEXT'}
                    onChange={() => updateDirectives({
                      ...directives,
                      system_permissions: { ...directives.system_permissions, calendar_granularity: 'FULL_CONTEXT' }
                    })}
                  />
                  <div className="ml-3">
                     <span className="block text-sm font-medium text-zinc-700">Full Context</span>
                     <span className="block text-xs text-zinc-400">Agent understands "Deep Work" vs "Dentist".</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-zinc-200 flex items-center justify-between">
               <div className="flex items-center">
                  <Activity size={18} className="mr-2 text-zinc-900" />
                  <div>
                     <h3 className="font-bold text-sm uppercase tracking-wide text-zinc-900">Health Sync</h3>
                     <p className="text-xs text-zinc-500">Auto-set "Recharge" if sleep &lt; 6h.</p>
                  </div>
               </div>
               <button 
                 onClick={() => updateDirectives({
                   ...directives,
                   system_permissions: { ...directives.system_permissions, health_sync: !directives.system_permissions.health_sync }
                 })}
                 className={`w-12 h-6 rounded-full p-1 transition-colors ${directives.system_permissions.health_sync ? 'bg-emerald-500' : 'bg-zinc-200'}`}
               >
                 <div className={`w-4 h-4 bg-white rounded-full transition-transform ${directives.system_permissions.health_sync ? 'translate-x-6' : ''}`} />
               </button>
            </div>

          </motion.div>
        )}

        {/* LAYER 2: AUTONOMY */}
        {activeTab === 'AUTONOMY' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <p className="text-sm text-zinc-500 mb-4">How proactive should your Agent be?</p>
            
            <AutonomyCard 
              level="LIBRARIAN" 
              title="The Librarian" 
              desc="Passive. Never initiates. Responds only when asked. Requires manual approval for everything."
              icon={Lock}
            />
            <AutonomyCard 
              level="CHIEF_OF_STAFF" 
              title="Chief of Staff" 
              desc="Balanced. Tentatively books timeslots. Requires confirmation for final commitment."
              icon={Shield}
            />
            <AutonomyCard 
              level="PROMOTER" 
              title="The Promoter" 
              desc="Aggressive. Proactively reaches out to contacts. Auto-accepts Inner Circle requests."
              icon={Zap}
            />

          </motion.div>
        )}

        {/* LAYER 3: RULEBOOK */}
        {activeTab === 'POLICY' && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
             
             <div className="bg-white p-5 rounded-lg border border-zinc-200">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wide">Blackout Windows</h3>
                   <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-1 rounded">AUTO-REJECT</span>
                </div>
                
                <div className="space-y-3">
                  {directives.social_policy.blackout_windows.map((window, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm border-b border-zinc-50 last:border-0 pb-2 last:pb-0">
                       <div className="flex items-center text-zinc-700">
                         <span className="font-bold w-20">{window.day}</span>
                         <span className="font-mono text-xs text-zinc-500">{window.start} - {window.end}</span>
                       </div>
                       <span className="text-xs text-zinc-400 italic">{window.reason}</span>
                    </div>
                  ))}
                  <button className="w-full py-2 text-xs text-zinc-400 border border-dashed border-zinc-300 rounded hover:bg-zinc-50">
                    + Add Blackout Rule
                  </button>
                </div>
             </div>

             <div className="bg-white p-5 rounded-lg border border-zinc-200">
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wide mb-4">Weekly Capacity</h3>
                <div className="flex items-center justify-between">
                   <span className="text-sm text-zinc-600">Max Social Events</span>
                   <div className="flex items-center bg-zinc-100 rounded-lg">
                      <button 
                        onClick={() => updateDirectives({
                           ...directives, 
                           social_policy: { ...directives.social_policy, max_social_events_per_week: Math.max(0, directives.social_policy.max_social_events_per_week - 1)}
                        })}
                        className="px-3 py-2 hover:bg-zinc-200 rounded-l-lg"
                      >-</button>
                      <span className="px-3 font-mono font-bold text-zinc-900">{directives.social_policy.max_social_events_per_week}</span>
                      <button 
                         onClick={() => updateDirectives({
                           ...directives, 
                           social_policy: { ...directives.social_policy, max_social_events_per_week: directives.social_policy.max_social_events_per_week + 1}
                        })}
                        className="px-3 py-2 hover:bg-zinc-200 rounded-r-lg"
                      >+</button>
                   </div>
                </div>
             </div>

           </motion.div>
        )}

      </div>
      
      {/* Footer Action */}
      <div className="p-6 bg-white border-t border-zinc-200">
        <button 
          onClick={() => setShowTestFlight(true)}
          className="w-full bg-zinc-900 text-white py-4 rounded-none font-bold text-sm tracking-widest uppercase hover:bg-zinc-800 transition-colors flex items-center justify-center"
        >
           <Zap size={16} className="mr-2 text-amber-400" />
           Test Flight
        </button>
      </div>

      {showTestFlight && (
        <TestFlight directives={directives} onClose={() => setShowTestFlight(false)} />
      )}

    </div>
  );
};
