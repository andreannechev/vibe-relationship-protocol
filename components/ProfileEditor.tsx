
import React from 'react';
import { User, UserStatus } from '../types';
import { StatusToggle } from './StatusToggle';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Sliders, ChevronRight, Calendar, BrainCircuit } from 'lucide-react';

interface ProfileEditorProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
  onOpenDirectives: () => void;
  onOpenCalendarSetup: () => void;
  onOpenNeuralBridge: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onUpdateUser, onBack, onOpenDirectives, onOpenCalendarSetup, onOpenNeuralBridge }) => {

  const handleStatusChange = (newStatus: UserStatus) => {
    onUpdateUser({ ...user, current_status: newStatus });
  };

  // Mock Social Battery Data for visualization
  const data = [
    { name: 'M', level: 80 },
    { name: 'T', level: 60 },
    { name: 'W', level: 40 },
    { name: 'T', level: 90 },
    { name: 'F', level: 20 },
    { name: 'S', level: 100 },
    { name: 'S', level: 85 },
  ];

  return (
    <div className="h-full overflow-y-auto bg-white pb-10">
      <div className="p-6 flex items-center border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <button onClick={onBack} className="text-zinc-400 hover:text-zinc-900 mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-light text-zinc-900">My Manual</h1>
      </div>

      <div className="p-6 space-y-10">
        
        {/* Section 1: Status */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
             <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Current Signal</h2>
             <span className="text-xs text-zinc-400">Updated just now</span>
          </div>
          <StatusToggle currentStatus={user.current_status} onStatusChange={handleStatusChange} />
        </section>

        {/* Configuration Links */}
        <section className="space-y-3">
           <button 
             onClick={onOpenDirectives}
             className="w-full flex items-center justify-between p-4 bg-zinc-900 text-white shadow-lg hover:bg-zinc-800 transition-all group"
           >
              <div className="flex items-center">
                 <Sliders size={20} className="mr-3 text-zinc-400 group-hover:text-white transition-colors" />
                 <div className="text-left">
                    <h3 className="font-bold text-sm tracking-wide">AGENT DIRECTIVES</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Configure Autonomy & Rules</p>
                 </div>
              </div>
              <ChevronRight size={20} className="text-zinc-500 group-hover:text-white" />
           </button>

           <button 
             onClick={onOpenCalendarSetup}
             className="w-full flex items-center justify-between p-4 bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-400 transition-all group"
           >
              <div className="flex items-center">
                 <Calendar size={20} className="mr-3 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                 <div className="text-left">
                    <h3 className="font-bold text-sm tracking-wide">THE AIRLOCK</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Calendar Sources & Privacy</p>
                 </div>
              </div>
              <ChevronRight size={20} className="text-zinc-300 group-hover:text-zinc-900" />
           </button>

           <button 
             onClick={onOpenNeuralBridge}
             className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-indigo-100 text-zinc-900 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
           >
              <div className="flex items-center">
                 <BrainCircuit size={20} className="mr-3 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                 <div className="text-left">
                    <h3 className="font-bold text-sm tracking-wide text-indigo-900">NEURAL BRIDGE</h3>
                    <p className="text-xs text-indigo-500 mt-0.5">Connect Your Second Brain</p>
                 </div>
              </div>
              <ChevronRight size={20} className="text-indigo-200 group-hover:text-indigo-500" />
           </button>
        </section>

        {/* Section 2: Bio Rhythm (Chart) */}
        <section>
          <div className="mb-4">
             <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Social Battery History</h2>
             <p className="text-xs text-zinc-500 mt-1">Your estimated bandwidth over the last 7 days.</p>
          </div>
          <div className="h-40 w-full border border-zinc-100 p-4 bg-zinc-50">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#a1a1aa'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', color: '#fff', border: 'none', fontSize: '12px' }}
                  cursor={{fill: 'rgba(0,0,0,0.05)'}}
                />
                <Bar dataKey="level" radius={[2, 2, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.level > 50 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Section 3: Policy Readout */}
        <section>
           <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-4">Communication Policy</h2>
           <div className="grid grid-cols-1 gap-0 border border-zinc-200 divide-y divide-zinc-200">
             <div className="p-4 flex justify-between bg-white">
               <span className="text-zinc-600 text-sm">Unannounced Calls</span>
               <span className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-600">{user.communication_policy.unannounced_calls}</span>
             </div>
             <div className="p-4 flex justify-between bg-white">
               <span className="text-zinc-600 text-sm">Voice Notes</span>
               <span className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-600">{user.communication_policy.voice_notes}</span>
             </div>
             <div className="p-4 flex justify-between bg-white">
               <span className="text-zinc-600 text-sm">Response Time</span>
               <span className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-600">{user.communication_policy.text_response_time}</span>
             </div>
           </div>
        </section>

      </div>
    </div>
  );
};
