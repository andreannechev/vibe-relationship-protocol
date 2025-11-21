
import React, { useState } from 'react';
import { User, Treaty, UserStatus } from '../types';
import { motion } from 'framer-motion';
import { Check, X, ShieldCheck, Activity, Battery, Smartphone } from 'lucide-react';

interface InviteLandingProps {
  sender: User;
  treaty: Treaty;
  onAccept: () => void;
  onDecline: () => void;
}

export const InviteLanding: React.FC<InviteLandingProps> = ({ sender, treaty, onAccept, onDecline }) => {
  const [step, setStep] = useState<'DOSSIER' | 'NEGOTIATE' | 'SIGN'>('DOSSIER');

  const getStatusColor = (s: UserStatus) => {
     if (s === UserStatus.OPEN) return 'text-emerald-500';
     if (s === UserStatus.RECHARGE) return 'text-rose-500';
     return 'text-amber-500';
  };

  return (
    <div className="fixed inset-0 bg-zinc-50 z-50 flex flex-col overflow-hidden font-sans text-zinc-900">
      
      {/* Mobile Browser Bar Simulation */}
      <div className="bg-zinc-200 h-12 flex items-center justify-center border-b border-zinc-300 px-4">
         <div className="flex items-center bg-zinc-300/50 px-3 py-1 rounded-lg text-[10px] text-zinc-600 w-full max-w-xs justify-center">
            <ShieldCheck size={10} className="mr-1" /> compact.app/treaty/{treaty.code}
         </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 pb-20">
        
        {step === 'DOSSIER' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Hero Profile */}
            <div className="text-center mt-8">
               <div className="w-20 h-20 bg-zinc-900 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-xl relative">
                  {sender.avatar_url && <img src={sender.avatar_url} className="w-full h-full object-cover opacity-90" />}
                  <div className={`absolute bottom-0 right-0 w-5 h-5 border-2 border-white rounded-full ${getStatusColor(sender.current_status).replace('text-', 'bg-')}`} />
               </div>
               <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{sender.name}</h1>
               <p className="text-sm text-zinc-500 mt-1">wants to sync protocols with you.</p>
            </div>

            {/* The Value Prop (Dossier) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200 space-y-4">
               <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">Current State Dossier</h3>
               
               <div className="flex items-start space-x-3">
                  <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500"><Activity size={18} /></div>
                  <div>
                     <div className="text-sm font-bold">Currently {sender.current_status.replace('_', ' ')}</div>
                     <div className="text-xs text-zinc-500 leading-relaxed mt-1">
                       {sender.current_status === 'RECHARGE' 
                         ? "Running low on social battery. Replies may be slow." 
                         : "Open to connection but prefers scheduled blocks."}
                     </div>
                  </div>
               </div>

               <div className="flex items-start space-x-3">
                  <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500"><Smartphone size={18} /></div>
                  <div>
                     <div className="text-sm font-bold">Comm Preference</div>
                     <div className="text-xs text-zinc-500 leading-relaxed mt-1">
                        Prefers <strong>{sender.communication_policy.voice_notes === 'LOVE' ? 'Voice Notes' : 'Text'}</strong>. 
                        <br/>Unannounced calls are <strong>{sender.communication_policy.unannounced_calls === 'BLOCK' ? 'Blocked' : 'Tolerated'}</strong>.
                     </div>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => setStep('NEGOTIATE')}
              className="w-full py-4 bg-zinc-900 text-white font-bold text-sm rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
            >
              Review Terms
            </button>
          </motion.div>
        )}

        {step === 'NEGOTIATE' && (
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-8">
              <h2 className="text-xl font-bold text-zinc-900 px-2">Define Your Terms</h2>
              <p className="text-sm text-zinc-500 px-2 -mt-4">How should {sender.name}'s Agent treat you?</p>

              <div className="space-y-3">
                 <button className="w-full p-4 border border-zinc-200 rounded-xl text-left hover:border-zinc-900 hover:bg-zinc-50 transition-all group">
                    <div className="font-bold text-sm group-hover:text-emerald-600">I'm Open</div>
                    <div className="text-xs text-zinc-500 mt-1">Send me invites anytime.</div>
                 </button>
                 <button className="w-full p-4 border border-zinc-200 rounded-xl text-left hover:border-zinc-900 hover:bg-zinc-50 transition-all group">
                    <div className="font-bold text-sm group-hover:text-amber-600">I'm Busy</div>
                    <div className="text-xs text-zinc-500 mt-1">Only urgent interruptions.</div>
                 </button>
              </div>

              <button 
                onClick={() => setStep('SIGN')}
                className="w-full py-4 bg-zinc-900 text-white font-bold text-sm rounded-xl shadow-lg mt-8"
              >
                Agree & Sign
              </button>
           </motion.div>
        )}

        {step === 'SIGN' && (
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center pt-20 space-y-8">
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-200">
                 <Check size={48} strokeWidth={3} />
              </div>
              
              <div className="text-center space-y-2">
                 <h2 className="text-2xl font-bold text-zinc-900">Protocol Signed</h2>
                 <p className="text-sm text-zinc-500">Agents are syncing calendars...</p>
              </div>

              <button 
                onClick={onAccept}
                className="w-full max-w-xs py-3 border border-zinc-300 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-zinc-50"
              >
                 Close Preview
              </button>
           </motion.div>
        )}

      </div>
    </div>
  );
};
